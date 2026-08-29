(() => {
  const data = window.PUBLIC_RENTAL_DATA;
  const escapeHtml = value => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const safeArray = value => Array.isArray(value) ? value : [];
  const regionLabel = region => region === "bellevue-downtown" ? "Bellevue Downtown" : "Redmond Downtown";
  const regionClass = region => region === "bellevue-downtown" ? "bellevue" : "redmond";
  const tierLabel = tier => tier === "deferred" ? "后置观察" : "重点候选";
  const state = { tier: "active" };

  const mediaHtml = media => {
    const poster = safeArray(media).find(item => item.type === "image")?.src || "";
    return safeArray(media).map(item => {
    const label = `<span class="media-label">${escapeHtml(item.label)} · ${escapeHtml(item.scope === "actual-unit" ? "实房" : item.scope === "unit-floorplan" ? "本房号户型图" : "社区参考")}</span>`;
    if (item.type === "video") {
      return `<figure class="media-frame media-frame--actual-unit"><video controls playsinline preload="metadata"${poster ? ` poster="${escapeHtml(poster)}"` : ""}><source src="${escapeHtml(item.src)}" type="video/mp4">当前浏览器无法播放此视频。</video>${label}</figure>`;
    }
    return `<figure class="media-frame media-frame--${escapeHtml(item.scope)}"><img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.label)}" loading="lazy">${label}</figure>`;
    }).join("");
  };

  const listHtml = values => safeArray(values).length
    ? `<ul>${values.map(value => `<li>${escapeHtml(value)}</li>`).join("")}</ul>`
    : "<p>暂无额外项目</p>";

  const tagsHtml = candidate => [
    `<span class="tag tag--${regionClass(candidate.region)}">${regionLabel(candidate.region)}</span>`,
    `<span class="tag tag--tier-${escapeHtml(candidate.tier)}">${tierLabel(candidate.tier)}</span>`,
    `<span class="tag">${escapeHtml(candidate.laundry)}</span>`,
    `<span class="tag">${escapeHtml(candidate.airConditioning)}</span>`,
    `<span class="tag">${escapeHtml(candidate.balcony)}</span>`
  ].join("");

  const noiseHtml = candidate => `<section class="noise-panel noise-panel--${escapeHtml(candidate.noise.level)}"><div class="noise-panel__heading"><span>噪音判断 · ${escapeHtml(candidate.noise.confidence)}可信度</span><strong>${escapeHtml(candidate.noise.label)}</strong></div><p>${escapeHtml(candidate.noise.summary)}</p><dl><div><dt>本房号风险</dt><dd>${escapeHtml(candidate.noise.unitRisk)}</dd></div><div><dt>怎么选</dt><dd>${escapeHtml(candidate.noise.action)}</dd></div></dl><div class="noise-sources">${safeArray(candidate.noise.sources).map(source => `<a href="${escapeHtml(source.href)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)} ↗</a>`).join("")}</div></section>`;

  const quickHtml = (candidate, index) => `
    <a class="quick-card" href="#${escapeHtml(candidate.id)}">
      <div class="quick-card__top"><span>#${index + 1}</span><span>${escapeHtml(regionLabel(candidate.region))}</span></div>
      <h3>${escapeHtml(candidate.community)} ${escapeHtml(candidate.unit)}</h3>
      <strong>${escapeHtml(candidate.effectiveBill)}</strong>
      <small>${escapeHtml(candidate.moveIn)} · ${escapeHtml(candidate.type)} · ${escapeHtml(candidate.noise.label)}</small>
    </a>`;

  const candidateHtml = (candidate, index) => `
    <article id="${escapeHtml(candidate.id)}" class="candidate">
      <div class="candidate__media" aria-label="${escapeHtml(candidate.community)}媒体">${mediaHtml(candidate.media)}</div>
      <div class="candidate__body">
        <div class="candidate__headline">
          <div>
            <span class="rank">${index + 1}</span>
            <h3>${escapeHtml(candidate.community)}</h3>
            <p class="candidate__meta">${escapeHtml(candidate.unit)} · ${escapeHtml(candidate.type)} · ${escapeHtml(candidate.sqft || "面积待确认")} sqft</p>
          </div>
          <div class="price"><strong>${escapeHtml(candidate.effectiveBill)}</strong><span>优惠后有效全包</span></div>
        </div>
        <div class="facts">
          <div class="fact"><span>正常账单</span><b>${escapeHtml(candidate.normalBill)}</b></div>
          <div class="fact"><span>入住 / 租期</span><b>${escapeHtml(candidate.moveIn)}<br>${escapeHtml(candidate.lease)}</b></div>
          <div class="fact"><span>通勤</span><b>${escapeHtml(candidate.commute)}</b></div>
          <div class="fact"><span>楼层 / 朝向</span><b>${escapeHtml(candidate.floor)}<br>${escapeHtml(candidate.direction)}</b></div>
        </div>
        <div class="tags">${tagsHtml(candidate)}</div>
        ${noiseHtml(candidate)}
        <div class="decision-grid">
          <div class="decision decision--pro"><span>最大优点</span><p>${escapeHtml(candidate.bestPro)}</p></div>
          <div class="decision decision--con"><span>最大缺点</span><p>${escapeHtml(candidate.biggestCon)}</p></div>
          <div class="decision decision--watch"><span>重点注意</span><p>${escapeHtml(candidate.watchOut)}</p></div>
        </div>
        <p class="effective-note">${escapeHtml(candidate.effectiveNote)}</p>
        <details>
          <summary>费用与待确认项目</summary>
          <div class="fee-grid">
            <div><h4>固定与优惠</h4>${listHtml([candidate.concession, ...safeArray(candidate.fixedFees)])}</div>
            <div><h4>变量与一次性费用</h4>${listHtml([...safeArray(candidate.variableFees), ...safeArray(candidate.oneTimeFees)])}</div>
            <div><h4>付款前确认</h4>${listHtml(candidate.unresolved)}</div>
          </div>
        </details>
        <div class="candidate__footer">
          <div class="source-links">${safeArray(candidate.links).map(link => `<a class="source-link" href="${escapeHtml(link.href)}" target="_blank" rel="noreferrer">${escapeHtml(link.label)} ↗</a>`).join("")}</div>
          <div class="score"><b>${candidate.valueScore}</b>已验证价值 · 资料 ${candidate.readinessScore}</div>
        </div>
      </div>
    </article>`;

  if (!data?.candidates?.length) {
    document.querySelector("#shortlist").innerHTML = "<p>候选资料未加载。</p>";
    return;
  }
  const candidatesForTier = tier => data.candidates.filter(candidate => candidate.tier === tier);
  const renderTierTabs = () => {
    document.querySelector("#tier-tabs").innerHTML = ["active", "deferred"].map(tier => `<button type="button" data-tier="${tier}" aria-pressed="${state.tier === tier}">${tierLabel(tier)} <span>${candidatesForTier(tier).length}</span></button>`).join("");
  };
  const renderTier = () => {
    const candidates = candidatesForTier(state.tier);
    renderTierTabs();
    document.querySelector("#shortlist-title").textContent = state.tier === "active" ? "逐套看" : "后置观察";
    document.querySelector("#shortlist").innerHTML = candidates.map(candidateHtml).join("");
  };
  document.querySelector("#updated-at").textContent = data.updatedAt;
  document.querySelector("#summary-note").textContent = `${data.summary.recommendation} ${data.summary.note}`;
  document.querySelector("#quick-compare").innerHTML = candidatesForTier("active").map(quickHtml).join("");
  document.querySelector("#tier-tabs").addEventListener("click", event => {
    const button = event.target.closest("[data-tier]");
    if (!button) return;
    state.tier = button.dataset.tier;
    renderTier();
  });
  renderTier();
})();
