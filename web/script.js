async function loadVaas() {
    const res = await fetch("/api/vaas");
    const vaas = await res.json();
    const tbody = document.getElementById("vaa-tbody");
    tbody.innerHTML = "";

    for (const v of vaas) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${v.emitter_chain}</td>
      <td><code>${v.emitter_human}</code></td>
      <td>${v.sequence}</td>
      <td>${new Date(v.created_at).toLocaleString()}</td>
    `;
        tbody.appendChild(tr);
    }
}

document.addEventListener("DOMContentLoaded", loadVaas);