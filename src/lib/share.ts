/** Render an SVG element to a PNG and download it. Throws on failure. */
export async function downloadSvgAsPng(svg: SVGSVGElement, filename = "my-ravan.png") {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", "900");
  clone.setAttribute("height", "1110");
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Could not render the image"));
      i.src = url;
    });
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1350;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, c.height);
    grd.addColorStop(0, "#070b22"); grd.addColorStop(0.7, "#1a1a4a"); grd.addColorStop(1, "#4a2430");
    g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 90, 150, 900, 1110);
    g.fillStyle = "#f2c35a"; g.textAlign = "center";
    g.font = "bold 64px Cinzel, Georgia, serif";
    g.fillText("Jai Shri Ram", c.width / 2, 100);
    g.font = "32px Mukta, sans-serif"; g.fillStyle = "#f5e6c4";
    g.fillText("Vijayadashami — Burai par Achhai ki Vijay", c.width / 2, 1310);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
    if (!blob) throw new Error("Could not create the image");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";
export async function shareExperience(): Promise<ShareResult> {
  const url = window.location.href.split("#")[0] ?? window.location.href;
  const data = { title: "Ravan Dahan — Vijayadashami", text: "Burai par Achhai ki Vijay! Celebrate Dussehra with this Ravan Dahan.", url };
  if (navigator.share) {
    try { await navigator.share(data); return "shared"; }
    catch (e) { if ((e as Error).name === "AbortError") return "cancelled"; }
  }
  try { await navigator.clipboard.writeText(url); return "copied"; }
  catch { return "failed"; }
}
