/**
 * ViralObj — export.js
 * Exports production package as:
 * 1. Interactive HTML dashboard (bilingual)
 * 2. Installable SKILL.md for Claude Code
 */

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { getOutputPath, getImplPath, ensureDirectories } from "../paths.js";

export async function exportArtifacts({ package: pkg, output_dir = null, slug }) {
  if (!pkg || !pkg.meta) throw new Error("Invalid package: missing meta");

  ensureDirectories();

  // Use central outputs/ unless overridden
  const resolvedOutputDir = output_dir || getOutputPath();

  // —— Generate slug ——————————————————————————————————————————————————————
  const autoSlug = `${pkg.meta.niche}-${pkg.meta.topic_en || pkg.meta.topic_pt || "talking-object"}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const finalSlug = slug || autoSlug;

  const htmlPath = join(resolvedOutputDir, `${finalSlug}.html`);
  const skillDir = join(resolvedOutputDir, `${finalSlug}-skill`);
  const refsDir = join(skillDir, "references");
  mkdirSync(resolvedOutputDir, { recursive: true });
  mkdirSync(refsDir, { recursive: true });

  // —— 1. Generate HTML ———————————————————————————————————————————————————
  const html = generateHTML(pkg, finalSlug);
  writeFileSync(htmlPath, html, "utf8");

  // —— 2. Generate SKILL.md ———————————————————————————————————————————————
  const skillMain = generateSkillMd(pkg, finalSlug);
  writeFileSync(join(skillDir, "SKILL.md"), skillMain, "utf8");

  // —— 3. Generate reference files ————————————————————————————————————————
  writeFileSync(join(refsDir, "characters.md"), generateCharactersMd(pkg), "utf8");
  writeFileSync(join(refsDir, "voice-scripts.md"), generateVoiceMd(pkg), "utf8");
  writeFileSync(join(refsDir, "post-copy.md"), generatePostMd(pkg), "utf8");

  return {
    content: [
      {
        type: "text",
        text: `✅ Artifacts exported

📄 HTML Dashboard: ${htmlPath}
🧠 Skill folder:   ${skillDir}/
   ├── SKILL.md
   └── references/
       ├── characters.md
       ├── voice-scripts.md
       └── post-copy.md

To install the skill in Claude Code:
  cp -r ${skillDir} /path/to/your/skills/user/

To install globally (nexoomnix-skills-mcp):
  cp -r ${skillDir} ~/nexoomnix-skills-mcp/skills/user/`,
      },
    ],
    html_path: htmlPath,
    skill_dir: skillDir,
  };
}

// ─── HTML GENERATOR ────────────────────────────────────────────────────────

function generateHTML(pkg, slug) {
  const { meta, characters = [], post_copy = {}, variations = [], production_stack = [] } = pkg;

  const charCards = characters.map((c, i) => `
    <div class="char-card">
      <div class="char-header">
        <span class="char-num">${String(i + 1).padStart(2, "0")}</span>
        <div class="char-info">
          <div class="char-name">${c.emoji || "🎭"} ${c.name_pt} / ${c.name_en}</div>
          <div class="char-sub">${c.environment_pt}</div>
        </div>
        <span class="time-badge">${c.timestamp_start}–${c.timestamp_end}</span>
      </div>
      <div class="expr-row">
        ${(c.expression_arc || []).map(e => `<span class="expr-badge">${e}</span>`).join('<span class="expr-arrow">→</span>')}
      </div>
      <div class="row"><div class="row-lbl">Error PT</div><div class="row-val">${c.error_denounced_pt || "—"}</div></div>
      <div class="row"><div class="row-lbl">Error EN</div><div class="row-val">${c.error_denounced_en || "—"}</div></div>
      <div class="prompt-block">
        <div class="prompt-lbl">🖼️ Midjourney Prompt</div>
        ${c.ai_prompt_midjourney || "—"}
      </div>
    </div>`).join("");

  const capRows = (pkg.captions_full_script || []).map(c => `
    <tr>
      <td class="tc-time">[${c.time}]</td>
      <td class="tc-text">${c.text_pt}</td>
      <td class="tc-text" style="color:#7ba8cc">${c.text_en}</td>
      <td class="tc-style">${c.character || "—"} · ${c.style || "bold"}</td>
    </tr>`).join("");

  const varCards = variations.map((v, i) => `
    <div class="var-card">
      <div class="var-num">Variation ${String(i + 1).padStart(2, "0")} · ${v.angle_en}</div>
      <div class="var-title">${v.title_pt}</div>
      <div class="var-hook">"${v.hook_pt}"</div>
      <div class="var-hook en">"${v.hook_en}"</div>
      <p style="font-size:12px;color:var(--text);margin-top:6px">${v.format_note_pt}</p>
      <div style="margin-top:8px">${(v.tags || []).map(t => `<span class="tag tag-b">${t}</span>`).join(" ")}</div>
    </div>`).join("");

  const stackRows = production_stack.map(s => `
    <div class="tool-row">
      <span class="step-num">${s.step}</span>
      <span class="tool-name">${s.tool}</span>
      <span class="tool-use">${s.purpose_pt}</span>
      <span class="tag ${s.priority === 'essential' ? 'tag-g' : 'tag-b'}">${s.priority}</span>
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ViralObj — ${meta.topic_pt || slug}</title>
<style>
:root{--bg:#0b0d12;--surface:#111318;--surface2:#171b24;--border:#222840;--blue:#5b9fff;--blue-mid:#3d7fbd;--gold:#c9a84c;--cream:#e2e8f0;--text:#a8b8cc;--text-dim:#3d5060;--red:#ff5b5b;--green:#5bff7a;--orange:#ffaa5b}
*{margin:0;padding:0;box-sizing:border-box}body{background:var(--bg);color:var(--text);font-family:monospace;font-size:13px;line-height:1.7}
.page-wrap{max-width:920px;margin:0 auto;padding:40px 24px 80px}
.badge{display:inline-block;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--blue);background:rgba(91,159,255,.08);border:1px solid rgba(91,159,255,.2);padding:3px 10px;border-radius:2px;margin-bottom:8px}
h1{font-size:30px;font-weight:900;color:var(--cream);margin-bottom:4px}h1 em{font-style:italic;color:var(--blue)}
.stat-row{display:flex;gap:10px;margin-bottom:24px;flex-wrap:wrap}.stat{background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:10px 16px;flex:1;min-width:80px;text-align:center}.stat-val{font-size:22px;font-weight:900;color:var(--blue);display:block}.stat-label{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--text-dim)}
.tabs{display:flex;gap:2px;margin-bottom:22px;border-bottom:1px solid var(--border)}.tab-btn{background:none;border:none;border-bottom:2px solid transparent;padding:10px 13px;cursor:pointer;font-size:11px;color:var(--text-dim);transition:all .2s}.tab-btn:hover{color:var(--cream)}.tab-btn.active{color:var(--blue);border-bottom-color:var(--blue)}
.panel{display:none}.panel.active{display:block}.card{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:20px 22px;margin-bottom:12px}
.char-card{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:15px 17px;margin-bottom:10px}.char-num{font-size:26px;font-weight:900;color:var(--border);min-width:32px}.char-name{font-size:14px;font-weight:700;color:var(--cream)}.char-sub{font-size:10px;color:var(--text-dim)}.time-badge{margin-left:auto;font-size:10px;color:var(--blue-mid)}
.expr-row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.expr-badge{font-size:10px;padding:2px 8px;border-radius:12px;background:rgba(91,159,255,.08);border:1px solid rgba(91,159,255,.15);color:var(--blue)}.expr-arrow{color:var(--text-dim);font-size:12px;line-height:2}
.row{display:grid;grid-template-columns:70px 1fr;gap:6px;margin-bottom:4px;font-size:12px}.row-lbl{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-dim)}.row-val{color:var(--text)}
.prompt-block{background:#080a0f;border:1px solid var(--border);border-radius:4px;padding:10px 12px;margin-top:8px;font-size:11px;color:var(--blue-mid);line-height:1.6}.prompt-lbl{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px}
.cap-table{width:100%;border-collapse:collapse;font-size:12px}.cap-table th{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim);text-align:left;padding:7px 10px;border-bottom:1px solid var(--border)}.cap-table td{padding:7px 10px;border-bottom:1px solid rgba(34,40,64,.5)}.tc-time{color:var(--blue-mid);font-size:11px;width:50px}.tc-text{color:var(--cream)}.tc-style{color:var(--text-dim);font-size:11px}
.post-preview{background:#080a0f;border:1px solid var(--border);border-radius:8px;padding:18px 20px;font-size:13px;line-height:1.9;color:var(--text);white-space:pre-line}.post-gancho{font-size:16px;font-weight:700;color:var(--cream);margin-bottom:10px;display:block}.hashtags{margin-top:12px;color:var(--blue-mid);font-size:11px;line-height:1.9;word-break:break-word}
.var-card{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px 16px;margin-bottom:10px}.var-num{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim)}.var-title{font-size:14px;font-weight:700;color:var(--cream);margin-bottom:6px}.var-hook{font-style:italic;color:var(--blue-mid);font-size:12px;margin-bottom:3px;padding-left:10px;border-left:2px solid var(--border)}.var-hook.en{color:var(--text-dim)}
.tag{display:inline-block;padding:2px 7px;border-radius:2px;font-size:10px;letter-spacing:.07em;text-transform:uppercase;margin:2px}.tag-b{background:rgba(91,159,255,.1);color:var(--blue);border:1px solid rgba(91,159,255,.2)}.tag-g{background:rgba(91,255,122,.1);color:var(--green);border:1px solid rgba(91,255,122,.2)}
.tool-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.tool-row:last-child{border-bottom:none}.tool-name{color:var(--cream);font-weight:500;min-width:110px}.tool-use{color:var(--text-dim);flex:1}
.copy-btn{display:inline-flex;align-items:center;gap:6px;background:rgba(91,159,255,.06);border:1px solid rgba(91,159,255,.2);border-radius:4px;padding:5px 12px;color:var(--blue);font-size:11px;cursor:pointer;margin-top:10px}.copy-btn:hover{background:rgba(91,159,255,.12)}
.lang-toggle{display:flex;gap:4px;margin-bottom:12px}.lang-btn{background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:4px 12px;font-size:11px;cursor:pointer;color:var(--text-dim)}.lang-btn.active{background:rgba(91,159,255,.1);border-color:rgba(91,159,255,.3);color:var(--blue)}
</style>
</head>
<body>
<div class="page-wrap">
  <div class="badge">ViralObj · viralobj.com</div>
  <h1>${meta.topic_pt || "Talking Object"} <em>/ ${meta.topic_en || ""}</em></h1>
  <p style="color:var(--text-dim);font-size:11px;margin-bottom:20px">${meta.niche} · ${meta.tone} · ${meta.duration}s · ${meta.objects_count} character(s)</p>
  <div class="stat-row">
    <div class="stat"><span class="stat-val">${characters.length}</span><span class="stat-label">Characters</span></div>
    <div class="stat"><span class="stat-val">${meta.duration}s</span><span class="stat-label">Duration</span></div>
    <div class="stat"><span class="stat-val">${variations.length}</span><span class="stat-label">Variations</span></div>
    <div class="stat"><span class="stat-val">${(post_copy.hashtags_pt?.length || 0) + (post_copy.hashtags_en?.length || 0)}</span><span class="stat-label">Hashtags</span></div>
  </div>
  <div class="tabs">
    <button class="tab-btn active" onclick="st('roteiro',this)">Script</button>
    <button class="tab-btn" onclick="st('legendas',this)">Captions</button>
    <button class="tab-btn" onclick="st('voz',this)">Voice</button>
    <button class="tab-btn" onclick="st('post',this)">Post</button>
    <button class="tab-btn" onclick="st('variacoes',this)">Variations</button>
    <button class="tab-btn" onclick="st('stack',this)">Stack</button>
  </div>
  <div class="panel active" id="panel-roteiro"><div class="card">${charCards || "<p>No characters.</p>"}</div></div>
  <div class="panel" id="panel-legendas"><div class="card"><table class="cap-table"><thead><tr><th>Time</th><th>PT-BR</th><th>English</th><th>Style</th></tr></thead><tbody>${capRows || "<tr><td colspan='4'>No captions.</td></tr>"}</tbody></table></div></div>
  <div class="panel" id="panel-voz"><div class="card">${characters.map((c) => `<div style="margin-bottom:16px"><div style="font-size:9px;color:var(--gold);margin-bottom:6px">${c.emoji||""} ${c.name_pt} — ${c.timestamp_start}–${c.timestamp_end}</div><div style="background:var(--surface2);border-left:3px solid var(--gold);padding:12px 16px;border-radius:0 4px 4px 0;margin-bottom:6px"><div style="font-size:9px;color:var(--text-dim);margin-bottom:4px">PT-BR</div><div style="font-style:italic;color:var(--cream);font-size:13px;line-height:1.9">${c.voice_script_pt||"—"}</div></div><div style="background:var(--surface2);border-left:3px solid var(--blue-mid);padding:12px 16px;border-radius:0 4px 4px 0"><div style="font-size:9px;color:var(--text-dim);margin-bottom:4px">EN</div><div style="font-style:italic;color:var(--cream);font-size:13px;line-height:1.9">${c.voice_script_en||"—"}</div></div></div>`).join("")}</div></div>
  <div class="panel" id="panel-post"><div class="card"><div class="lang-toggle"><button class="lang-btn active" onclick="showLang('pt',this)">PT-BR</button><button class="lang-btn" onclick="showLang('en',this)">English</button></div><div id="post-pt"><div class="post-preview"><span class="post-gancho">${post_copy.hook_pt||""}</span>${post_copy.body_pt||""}\n\n${post_copy.cta_pt||""}</div><div class="hashtags">${(post_copy.hashtags_pt||[]).join(" ")}</div></div><div id="post-en" style="display:none"><div class="post-preview"><span class="post-gancho">${post_copy.hook_en||""}</span>${post_copy.body_en||""}\n\n${post_copy.cta_en||""}</div><div class="hashtags">${(post_copy.hashtags_en||[]).join(" ")}</div></div></div></div>
  <div class="panel" id="panel-variacoes"><div class="card">${varCards || "<p>No variations.</p>"}</div></div>
  <div class="panel" id="panel-stack"><div class="card">${stackRows || "<p>No stack.</p>"}</div></div>
</div>
<script>
function st(id,btn){document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById('panel-'+id).classList.add('active');btn.classList.add('active')}
function showLang(lang,btn){document.getElementById('post-pt').style.display=lang==='pt'?'block':'none';document.getElementById('post-en').style.display=lang==='en'?'block':'none';document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active')}
</script>
</body>
</html>`;
}

function encodePostText(post_copy, lang) {
  const text = lang === "pt"
    ? `${post_copy.hook_pt || ""}\n\n${post_copy.body_pt || ""}\n\n${post_copy.cta_pt || ""}\n\n${(post_copy.hashtags_pt || []).join(" ")}`
    : `${post_copy.hook_en || ""}\n\n${post_copy.body_en || ""}\n\n${post_copy.cta_en || ""}\n\n${(post_copy.hashtags_en || []).join(" ")}`;
  return encodeURIComponent(text);
}

function generateSkillMd(pkg, slug) {
  const { meta, characters = [] } = pkg;
  const objectList = characters.map(c => c.name_pt).join(", ");
  const desc = `ViralObj skill for "${meta.topic_pt}" (${meta.niche} niche). Objects: ${objectList}. Tone: ${meta.tone}. viralobj.com.`.slice(0, 950);
  return `---\nname: ${slug}\nversion: 1.0\ndescription: >\n  ${desc}\n---\n\n# ViralObj Skill — ${meta.topic_pt}\n**viralobj.com** · ${meta.niche} · ${meta.tone} · ${meta.duration}s\n\n## References\n- \`references/characters.md\`\n- \`references/voice-scripts.md\`\n- \`references/post-copy.md\`\n`;
}

function generateCharactersMd(pkg) {
  return `# Characters + AI Prompts\n\n` + (pkg.characters || []).map((c, i) => `## ${i+1}. ${c.name_pt} / ${c.name_en} ${c.emoji||""}\n\n**Time:** ${c.timestamp_start}–${c.timestamp_end}\n**Environment PT:** ${c.environment_pt}\n**Environment EN:** ${c.environment_en}\n**Expression arc:** ${(c.expression_arc||[]).join(" → ")}\n\n### Prompt\n\`\`\`\n${c.ai_prompt_midjourney||"—"}\n\`\`\`\n`).join("\n---\n");
}

function generateVoiceMd(pkg) {
  return `# Voice Scripts\n\n` + (pkg.characters || []).map((c, i) => `## ${i+1}. ${c.name_pt} ${c.emoji||""}\n\n**PT-BR:**\n> ${c.voice_script_pt||"—"}\n\n**EN:**\n> ${c.voice_script_en||"—"}\n`).join("\n---\n");
}

function generatePostMd(pkg) {
  const p = pkg.post_copy || {};
  return `# Post Copy\n\n## PT-BR\n**Hook:** ${p.hook_pt||"—"}\n\n${p.body_pt||"—"}\n\n${p.cta_pt||"—"}\n\n**Hashtags:** ${(p.hashtags_pt||[]).join(" ")}\n\n---\n\n## English\n**Hook:** ${p.hook_en||"—"}\n\n${p.body_en||"—"}\n\n${p.cta_en||"—"}\n\n**Hashtags:** ${(p.hashtags_en||[]).join(" ")}\n`;
}
