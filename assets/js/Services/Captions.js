// Update parseVTT to only use align and map position accordingly
export function parseVTT(data) {
  const lines = String(data || "").split(/\r?\n/);
  const out = [];
  let i = 0;

  if (lines[i]?.includes("WEBVTT")) i++;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("NOTE")) {
      while (lines[++i]?.trim() !== "") {}
      continue;
    }

    let cueId = null;
    if (!line.includes("-->")) {
      cueId = line;
      line = lines[++i]?.trim();
    }

    if (!line?.includes("-->")) {
      i++;
      continue;
    }

    const [start, restRaw] = line.split("-->").map((s) => s.trim());
    let end = restRaw;
    let align = "center";

    const settingsMatch = restRaw.match(/([0-9:.]+)\s+(.*)/);
    if (settingsMatch) {
      end = settingsMatch[1];
      const settings = settingsMatch[2].split(/\s+/);
      settings.forEach((s) => {
        if (s.startsWith("position:")) {
          const pos = parseInt(s.split(":")[1], 10);
          if (pos <= 30) align = "left";
          else if (pos >= 70) align = "right";
          else align = "center";
        }
        if (s.startsWith("align:")) {
          // ignore, we only use position for alignment now
        }
      });
    }

    i++;

    let text = "";
    while (lines[i]?.trim()) text += lines[i++] + "\n";
    text = text.trim();
    i++;

    out.push({
      index: out.length + 1,
      id: cueId,
      start,
      end,
      duration: computeVTTDuration(start, end),
      text,
      align,
    });
  }

  return out;
}

// Update buildVttText to only use position based on align, always align:center
export function buildVttText(cues) {
  return (
    "WEBVTT\n\n" +
    cues
      .map(
        (cue) => {
          let position = 50;
          if (cue.align === "left") position = 20;
          else if (cue.align === "right") position = 80;
          else position = 50;
          return `${cue.start} --> ${cue.end} position:${position}% align:center\n${cue.text}\n`;
        }
      )
      .join("\n")
  );
}

export function vttToMS(t) {
  const parts = String(t || "").split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Number(h) * 3600000 + Number(m) * 60000 + Number(s) * 1000;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Number(m) * 60000 + Number(s) * 1000;
  }
  return 0;
}

export function computeVTTDuration(start, end) {
  return ((vttToMS(end) - vttToMS(start)) / 1000).toFixed(3);
}

export function formatTimeVTT(seconds) {
  const ms = Math.floor((seconds % 1) * 1000);
  const totalSeconds = Math.floor(seconds);
  const s = totalSeconds % 60;
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
}

export function formatVTTTime(sec) {
  return formatTimeVTT(sec);
}

export function normalizeVttTime(str) {
  const match = String(str).match(/^(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?$/);
  if (!match) return str;
  const ms = (match[5] || "0").padEnd(3, "0").slice(0, 3);
  return `${match[1]}:${match[2]}:${match[3]}.${ms}`;
}