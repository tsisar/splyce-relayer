async function loadVaas() {
    const res = await fetch("/api/vaas");
    const vaas = await res.json();
    const tbody = document.getElementById("vaa-tbody");
    tbody.innerHTML = "";

    for (const v of vaas) {
        const link = `https://wormholescan.io/#/tx/${v.emitter_chain}/${v.emitter}/${v.sequence}?network=Testnet`;

        const tr = document.createElement("tr");
        tr.classList.add("clickable-row");
        tr.onclick = () => window.open(link, "_blank");

        const status = (v.status || "").toLowerCase();
        const statusClass = {
            received: "status-received",
            failed: "status-failed",
            completed: "status-completed"
        }[status] || "";

        tr.innerHTML = `
          <td>${v.emitter_chain}</td>
          <td><code>${v.emitter}</code></td>
          <td>${v.sequence}</td>
          <td>${new Date(v.created_at).toLocaleString()}</td>
          <td class="${statusClass}">${v.status}</td>
          <td><button class="btn btn-sm btn-outline-secondary retry-btn">Retry</button></td>
        `;

        tbody.appendChild(tr);

        tr.querySelector(".retry-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // щоб не відкривалося wormholescan
            fetch("/api/recover-vaa", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    emitterChain: v.emitter_chain,
                    emitterAddress: v.emitter,
                    sequence: v.sequence
                })
            }).then(res => {
                if (res.ok) {
                    alert("VAA recovery triggered");
                } else {
                    alert("Failed to trigger recovery");
                }
                setTimeout(() => window.location.reload(), 1000);
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", loadVaas);