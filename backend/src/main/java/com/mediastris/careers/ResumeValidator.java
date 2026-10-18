package com.mediastris.careers;
import com.mediastris.contact.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.cos.*;
import org.apache.poi.poifs.filesystem.*;
import java.io.*;
import java.util.*;
import java.util.zip.*;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
@Component
public class ResumeValidator {
    public record Resume(byte[] bytes,String filename,String contentType){@Override public String toString(){return "Resume[redacted]";}}
    private static final int MAX=5*1024*1024;
    private static final Set<String> ACTIVE=Set.of("JS","JavaScript","OpenAction","AA","EmbeddedFiles","EmbeddedFile","Launch","RichMedia","XFA","AcroForm","GoToR","GoToE","SubmitForm","ImportData","Sound","Movie","Rendition");
    public Resume validate(MultipartFile file){
        if(file==null||file.isEmpty())throw invalid();if(file.getSize()>MAX)throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE,"RESUME_TOO_LARGE","Resume must be at most 5 MB.");
        String filename=Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase(Locale.ROOT);String extension=filename.substring(filename.lastIndexOf('.')+1);
        String mime=switch(extension){case "pdf"->"application/pdf";case "doc"->"application/msword";case "docx"->"application/vnd.openxmlformats-officedocument.wordprocessingml.document";default->throw invalid();};
        if(file.getContentType()!=null&&!Set.of(mime,"application/octet-stream","").contains(file.getContentType().toLowerCase(Locale.ROOT)))throw invalid();
        try(var input=file.getInputStream()){
            byte[] data=input.readNBytes(MAX+1);if(data.length>MAX)throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE,"RESUME_TOO_LARGE","Resume must be at most 5 MB.");
            switch(extension){case "pdf"->pdf(data);case "doc"->doc(data);case "docx"->docx(data);default->throw invalid();}
            return new Resume(data,"resume."+extension,mime);
        }catch(ApiException ex){throw ex;}catch(Exception ex){throw invalid();}
    }
    private void pdf(byte[] data)throws IOException{
        if(data.length<10||!new String(data,0,5,java.nio.charset.StandardCharsets.US_ASCII).equals("%PDF-"))throw invalid();
        try(var document=Loader.loadPDF(data)){
            if(document.isEncrypted()||document.getNumberOfPages()<1||document.getNumberOfPages()>50)throw invalid();
            Set<COSBase> seen=Collections.newSetFromMap(new IdentityHashMap<>());Deque<COSBase> queue=new ArrayDeque<>();queue.add(document.getDocument().getTrailer());int count=0;
            while(!queue.isEmpty()){COSBase value=queue.removeFirst();if(value instanceof COSName name&&ACTIVE.contains(name.getName()))throw invalid();if(!seen.add(value))continue;if(++count>20000)throw invalid();if(value instanceof COSObject object){if(object.getObject()!=null)queue.add(object.getObject());}else if(value instanceof COSDictionary dict){for(var entry:dict.entrySet()){if(ACTIVE.contains(entry.getKey().getName()))throw invalid();if(entry.getValue()!=null)queue.add(entry.getValue());}}else if(value instanceof COSArray array){for(COSBase child:array)if(child!=null)queue.add(child);}}
        }
    }
    private void doc(byte[] data)throws IOException{
        byte[] signature={(byte)0xd0,(byte)0xcf,0x11,(byte)0xe0,(byte)0xa1,(byte)0xb1,0x1a,(byte)0xe1};if(data.length<512||!Arrays.equals(Arrays.copyOf(data,8),signature))throw invalid();
        try(var filesystem=new POIFSFileSystem(new ByteArrayInputStream(data))){var root=filesystem.getRoot();if(!root.hasEntry("WordDocument")||(!root.hasEntry("0Table")&&!root.hasEntry("1Table")))throw invalid();Deque<DirectoryEntry> directories=new ArrayDeque<>();directories.add(root);int count=0;while(!directories.isEmpty()){for(Entry entry:directories.removeFirst()){if(++count>512)throw invalid();String name=entry.getName().toLowerCase(Locale.ROOT);if(name.contains("vba")||name.contains("macro")||name.equals("objectpool")||name.contains("encrypt"))throw invalid();if(entry instanceof DirectoryEntry directory)directories.add(directory);}}
            try(var word=root.createDocumentInputStream("WordDocument")){byte[] header=word.readNBytes(32);if(header.length<32||(header[0]&255)!=0xec||(header[1]&255)!=0xa5)throw invalid();int flags=(header[10]&255)|((header[11]&255)<<8);if((flags&0x8100)!=0)throw invalid();}
        }
    }
    private void docx(byte[] data)throws Exception{
        if(data.length<4||data[0]!='P'||data[1]!='K'||data[2]!=3||data[3]!=4)throw invalid();boolean document=false,types=false;int entries=0,total=0;Set<String> names=new HashSet<>();
        try(var zip=new ZipInputStream(new ByteArrayInputStream(data))){for(ZipEntry entry;(entry=zip.getNextEntry())!=null;){String name=entry.getName();String lower=name.toLowerCase(Locale.ROOT);if(++entries>1000||!names.add(name)||name.startsWith("/")||name.contains("..")||name.contains("\\")||lower.contains("vba")||lower.contains("activex")||lower.contains("embeddings/")||lower.endsWith(".exe")||lower.endsWith(".bin"))throw invalid();byte[] bytes=zip.readNBytes(10*1024*1024+1);total+=bytes.length;if(bytes.length>10*1024*1024||total>25*1024*1024)throw invalid();
                if(name.endsWith(".xml")||name.endsWith(".rels")){var xml=xml(bytes);rejectFields(xml);if(name.equals("word/document.xml")){if(!"document".equals(xml.getDocumentElement().getLocalName())||!Set.of("http://schemas.openxmlformats.org/wordprocessingml/2006/main","http://purl.oclc.org/ooxml/wordprocessingml/main").contains(xml.getDocumentElement().getNamespaceURI()))throw invalid();document=true;}if(name.equals("[Content_Types].xml")){var overrides=xml.getElementsByTagNameNS("*","Override");for(int i=0;i<overrides.getLength();i++){var node=(org.w3c.dom.Element)overrides.item(i);if(node.getAttribute("PartName").equals("/word/document.xml")&&node.getAttribute("ContentType").equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"))types=true;}}var relationships=xml.getElementsByTagNameNS("*","Relationship");for(int i=0;i<relationships.getLength();i++){var rel=(org.w3c.dom.Element)relationships.item(i);String relationType=rel.getAttribute("Type").toLowerCase(Locale.ROOT);if(relationType.contains("vba")||relationType.contains("activex")||relationType.contains("oleobject"))throw invalid();if("External".equalsIgnoreCase(rel.getAttribute("TargetMode"))&&(!rel.getAttribute("Type").endsWith("/hyperlink")||!rel.getAttribute("Target").matches("(?i)^(https?://|mailto:).+")))throw invalid();}}
            }}if(!document||!types)throw invalid();
    }
    private void rejectFields(org.w3c.dom.Document document){StringBuilder instructions=new StringBuilder();var text=document.getElementsByTagNameNS("*","instrText");for(int i=0;i<text.getLength();i++)instructions.append(text.item(i).getTextContent());var simple=document.getElementsByTagNameNS("*","fldSimple");for(int i=0;i<simple.getLength();i++){var attributes=simple.item(i).getAttributes();for(int j=0;j<attributes.getLength();j++)if("instr".equals(attributes.item(j).getLocalName()))instructions.append(attributes.item(j).getNodeValue());}String combined=instructions.toString().toUpperCase(Locale.ROOT);if(combined.contains("DDE")||combined.contains("INCLUDETEXT")||combined.contains("INCLUDEPICTURE")||combined.matches("(?s).*\\bLINK\\b.*"))throw invalid();}
    private org.w3c.dom.Document xml(byte[] bytes)throws Exception{var factory=DocumentBuilderFactory.newInstance();factory.setNamespaceAware(true);factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);factory.setFeature("http://xml.org/sax/features/external-general-entities",false);factory.setFeature("http://xml.org/sax/features/external-parameter-entities",false);factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA,"");factory.setXIncludeAware(false);factory.setExpandEntityReferences(false);var builder=factory.newDocumentBuilder();builder.setErrorHandler(new org.xml.sax.helpers.DefaultHandler(){@Override public void fatalError(org.xml.sax.SAXParseException e)throws org.xml.sax.SAXException{throw e;}});return builder.parse(new ByteArrayInputStream(bytes));}
    private ApiException invalid(){return new ApiException(HttpStatus.BAD_REQUEST,"INVALID_RESUME","Upload a valid, unencrypted PDF, DOC or DOCX without macros, embedded files or active content.");}
}
