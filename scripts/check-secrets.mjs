import { execFileSync } from "node:child_process";
import path from "node:path";

// Scan the index, not just the worktree, so previously staged secrets are caught.
// Report paths/line numbers/rule names only; never echo potential secret values.
const git = (args) => execFileSync("git", args, { maxBuffer: 64 * 1024 * 1024 });
const root = git(["rev-parse", "--show-toplevel"]).toString().trim();
process.chdir(root);
const files = git(["ls-files", "--cached", "-z"]).toString().split("\0").filter(Boolean);
const rules = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |ENCRYPTED )?PRIVATE KEY-----/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["Google API key", /\bAIza[A-Za-z0-9_-]{30,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["Stripe secret", /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/],
  ["credential in URL", /https?:\/\/[^\s/:"']+:[^\s/@"']+@/],
  ["assigned credential", /["']?(?:SMTP_PASSWORD|SMTP_USERNAME|GOOGLE_PLACES_API_KEY|SMS_AUTH_TOKEN|GITHUB_TOKEN|API_KEY|CLIENT_SECRET|PASSWORD|ACCESS_TOKEN)["']?\s*[:=]\s*["']?(?!\$\{|\s*$|["']\s*[,;}]?\s*$)[A-Za-z0-9_+/.=-]{12,}/i],
];
const findings = [];
for (const file of files) {
  const name = path.posix.basename(file);
  if ((/^\.env(?:\.|$)/.test(name) && !name.endsWith(".example")) || /\.(?:pem|key|p12|pfx|jks|keystore)$/i.test(name) || /^(?:credentials.*|service-account.*|secrets)\.(?:json|ya?ml)$/i.test(name)) {
    findings.push(`${file}: blocked credential filename`);
  }
  if (/^(?:\.tools|node_modules|dist|target)\//.test(file) || /\/(?:node_modules|dist|target)\//.test(file)) {
    findings.push(`${file}: generated dependency/build artifact`);
  }
  const data = git(["show", `:${file}`]);
  if (data.includes(0)) continue;
  data.toString("utf8").split(/\r?\n/).forEach((line, i) => {
    for (const [label, pattern] of rules) {
      if (pattern.test(line)) findings.push(`${file}:${i + 1}: ${label}`);
    }
  });
}
if (findings.length) {
  console.error(findings.join("\n"));
  console.error("Review these potential secrets before committing or pushing.");
  process.exitCode = 1;
} else {
  console.log(`PASS: ${files.length} staged/tracked files checked; no common secret patterns or blocked artifacts found.`);
  console.log("Pattern scanning cannot prove the absence of every secret. Review repository contents before publication.");
}
