let currentPage = 1;

// Load VAAs for the given page
async function loadVaas(page = 1) {
    const res = await fetch(`/api/vaas?page=${page}`);
    const vaas = await res.json();
    currentPage = page;

    // Update current page label
    document.getElementById("page-indicator").innerText = `Page ${page}`;

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
          <td title="${v.created_at}">${new Date(v.created_at).toLocaleString()}</td>
          <td class="${statusClass}">${v.status}</td>
          <td><button class="btn btn-sm btn-outline-primary tx-btn">Transactions</button></td>
          <td><button class="btn btn-sm btn-outline-secondary retry-btn">Retry</button></td>
        `;

        tbody.appendChild(tr);

        // Open transaction list modal
        tr.querySelector(".tx-btn").addEventListener("click", async (e) => {
            e.stopPropagation();

            const res = await fetch(`/api/vaa-tx?emitterChain=${v.emitter_chain}&emitterAddress=${v.emitter}&sequence=${v.sequence}`);
            const json = await res.json();

            if (res.ok && json.txs?.length) {
                const links = json.txs
                    .map(tx => `<li><a href="https://explorer.solana.com/tx/${tx}?cluster=devnet" target="_blank">${tx}</a></li>`)
                    .join("");

                const html = `<div>
                    <h5>Transaction Hashes:</h5>
                    <ul>${links}</ul>
                </div>`;

                showModal(html);
            } else {
                showModal("<p>No transactions found for this VAA.</p>");
            }
        });

        // Retry VAA processing
        tr.querySelector(".retry-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            fetch("/api/recover-vaa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

// Show transaction list modal
function showModal(html) {
    document.getElementById("txModalBody").innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById("txModal"));
    modal.show();
}

// Pagination buttons
document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) loadVaas(currentPage - 1);
});

document.getElementById("next-page").addEventListener("click", () => {
    loadVaas(currentPage + 1);
});

document.addEventListener("DOMContentLoaded", () => loadVaas());