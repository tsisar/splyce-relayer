let currentPage = 1;
let environment = "dev";

async function loadEnvironment() {
    try {
        const res = await fetch("/env");
        const data = await res.json();
        environment = data.environment;
    } catch (err) {
        console.warn("Failed to load environment config, defaulting to devnet", err);
    }
}

async function loadVaas(page = 1) {
    showLoading();

    try {
        const res = await fetch(`/api/vaas?page=${page}`);
        const vaas = await res.json();
        currentPage = page;

        document.getElementById("page-indicator").innerText = `Page ${page}`;

        const tbody = document.getElementById("vaa-tbody");
        tbody.innerHTML = "";

        for (const v of vaas) {
            const network = environment === "prod" ? "Mainnet" : "Testnet";
            const link = `https://wormholescan.io/#/tx/${v.emitter_chain}/${v.emitter}/${v.sequence}?network=${network}`;

            const tr = document.createElement("tr");
            tr.classList.add("clickable-row");
            tr.onclick = () => window.open(link, "_blank");

            const status = (v.status || "").toLowerCase();
            let statusIcon = "";

            if (status === "completed") {
                statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="green" viewBox="0 0 24 24"><path d="M20.285 2.859l-11.285 11.285-5.285-5.285-3.715 3.715 9 9 15-15z"/></svg>`;
            } else if (status === "failed") {
                statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke="red" stroke-width="3.5" fill="none" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>`;
            } else {
                statusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="gray" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="none"/></svg>`;
            }

            tr.innerHTML = `
              <td>${v.emitter_chain}</td>
              <td>${v.emitter}</td>
              <td>${v.sequence}</td>
              <td title="${v.created_at}">${new Date(v.created_at).toLocaleString()}</td>
              <td class="text-center">${statusIcon}</td>
              <td><button class="btn btn-sm btn-outline-primary tx-btn">Transactions</button></td>
              <td><button class="btn btn-sm btn-outline-secondary retry-btn">Retry</button></td>
            `;

            tbody.appendChild(tr);

            tr.querySelector(".tx-btn").addEventListener("click", async (e) => {
                e.stopPropagation();
                const res = await fetch(`/api/vaa-tx?emitterChain=${v.emitter_chain}&emitterAddress=${v.emitter}&sequence=${v.sequence}`);
                const json = await res.json();

                if (res.ok && json.txs?.length) {
                    const links = json.txs.map(({ tx_hash, created_at }) => `
                        <li class="pb-2 mb-2 border-bottom">
                            <div class="d-flex flex-column">
                                <a href="https://explorer.solana.com/tx/${tx_hash}?cluster=${environment === "prod" ? "mainnet-beta" : "devnet"}"
                                   class="text-break"
                                   target="_blank">${tx_hash}</a>
                                <small class="text-muted">${new Date(created_at).toLocaleString()}</small>
                            </div>
                        </li>
                    `).join("");

                    showModal(`<div><h5>Transaction Hashes:</h5><ul>${links}</ul></div>`);
                } else {
                    showModal("<p>No transactions found for this VAA.</p>");
                }
            });

            tr.querySelector(".retry-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                showLoading();
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
                    hideLoading();
                    setTimeout(() => window.location.reload(), 500);
                });
            });
        }
    } catch (err) {
        console.error("Failed to load VAAs:", err);
    } finally {
        hideLoading();
    }
}

function showModal(html) {
    document.getElementById("txModalBody").innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById("txModal"));
    modal.show();
}

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) loadVaas(currentPage - 1);
});

document.getElementById("next-page").addEventListener("click", () => {
    loadVaas(currentPage + 1);
});

document.getElementById("manual-fetch").addEventListener("click", async () => {
    const modalElement = document.getElementById("manualFetchModal");
    const form = document.getElementById("manual-fetch-form");

    try {
        const res = await fetch("/api/vaas?page=1");
        const vaas = await res.json();
        const latest = vaas[0];

        if (latest) {
            form.emitterChain.value = latest.emitter_chain;
            form.emitterAddress.value = latest.emitter;
            form.sequence.value = latest.sequence;
        }
    } catch (err) {
        console.warn("Failed to fetch latest VAA:", err);
    }

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
});

document.getElementById("manual-fetch-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    showLoading();

    const form = e.target;
    const emitterChain = form.emitterChain.value.trim();
    const emitterAddress = form.emitterAddress.value.trim();
    const sequence = form.sequence.value.trim();
    const force = true;

    const res = await fetch("/api/recover-vaa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emitterChain, emitterAddress, sequence, force }),
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("manualFetchModal"));
    modal.hide();

    if (res.ok) {
        alert("Manual fetch triggered");
    } else {
        alert("Failed to trigger manual fetch");
    }
    hideLoading();
    setTimeout(() => window.location.reload(), 500);
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadEnvironment();
    loadVaas();
});

function showLoading() {
    document.getElementById("loading-overlay").classList.remove("d-none");
}

function hideLoading() {
    document.getElementById("loading-overlay").classList.add("d-none");
}

document.getElementById("test-transfer").addEventListener("click", () => {
    window.open("/test-transfer.html", "_blank");
});