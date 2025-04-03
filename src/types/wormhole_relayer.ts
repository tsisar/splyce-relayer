/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/wormhole_relayer.json`.
 */
export type WormholeRelayer = {
  "address": "8vf4LsW4saqaGVJNj1mZNYX88ojp9hYc1EEnwCHWHCGa",
  "metadata": {
    "name": "wormholeRelayer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "executeDeposit",
      "discriminator": [
        247,
        103,
        46,
        184,
        88,
        188,
        56,
        46
      ],
      "accounts": [
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  101,
                  109,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "deposit",
          "writable": true
        },
        {
          "name": "recipientSharesAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "sharesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "accountant",
          "writable": true
        },
        {
          "name": "accountantRecipient",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "accountant"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "sharesMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  114,
                  108,
                  121,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenizedVaultProgram"
            }
          }
        },
        {
          "name": "sharesMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  104,
                  97,
                  114,
                  101,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenizedVaultProgram"
            }
          }
        },
        {
          "name": "underlyingMint",
          "writable": true
        },
        {
          "name": "userData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "vault"
              },
              {
                "kind": "account",
                "path": "payer"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenizedVaultProgram"
            }
          }
        },
        {
          "name": "kycVerified",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  111,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "payer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "accessControl"
            }
          }
        },
        {
          "name": "relayerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "underlyingMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated Token program."
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenizedVaultProgram",
          "docs": [
            "Tokenized Vault program"
          ],
          "address": "8W6y1nfFM9Z5tCZfebUwvSzBtNBR8pbuGhfLHJBFtYUT"
        },
        {
          "name": "accessControl",
          "docs": [
            "Access Control program"
          ],
          "address": "HypkKDB5Mxv9WbBTc9dFWkowFN38NRgc1fbTpgBWfBEe"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program."
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "redeemerConfig",
          "docs": [
            "Redeemer Config account, which saves program data useful for other",
            "instructions, specifically for inbound transfers. Also saves the payer",
            "of the [`initialize`](crate::initialize) instruction as the program's",
            "owner."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  101,
                  109,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "tokenBridgeConfig",
          "docs": [
            "Token Bridge config. Token Bridge program needs this account to",
            "invoke the Wormhole program to post messages. Even though it is a",
            "required account for redeeming token transfers, it is not actually",
            "used for completing these transfers."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenBridgeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeCustodySigner",
          "docs": [
            "data; it is purely just a signer for Token Bridge SPL tranfers."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  115,
                  116,
                  111,
                  100,
                  121,
                  95,
                  115,
                  105,
                  103,
                  110,
                  101,
                  114
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenBridgeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeMintAuthority",
          "docs": [
            "data; it is purely just a signer (SPL mint authority) for Token Bridge",
            "wrapped assets."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  115,
                  105,
                  103,
                  110,
                  101,
                  114
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenBridgeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeEmitter",
          "docs": [
            "that holds data; it is purely just a signer for posting Wormhole",
            "messages on behalf of the Token Bridge program."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  109,
                  105,
                  116,
                  116,
                  101,
                  114
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenBridgeProgram"
            }
          }
        },
        {
          "name": "wormholeFeeCollector",
          "docs": [
            "Wormhole fee collector account, which requires lamports before the",
            "program can post a message (if there is a fee). Token Bridge program",
            "handles the fee payments."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  111,
                  114
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "wormholeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeSequence",
          "docs": [
            "Token Bridge emitter's sequence account. Like with all Wormhole",
            "emitters, this account keeps track of the sequence number of the last",
            "posted message."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  101,
                  113,
                  117,
                  101,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "tokenBridgeEmitter"
              }
            ],
            "program": {
              "kind": "account",
              "path": "wormholeProgram"
            }
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "wormholeProgram",
          "docs": [
            "Wormhole program."
          ],
          "address": "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"
        },
        {
          "name": "tokenBridgeProgram",
          "docs": [
            "Token Bridge program."
          ],
          "address": "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe"
        }
      ],
      "args": []
    },
    {
      "name": "receive",
      "discriminator": [
        86,
        17,
        255,
        171,
        17,
        17,
        187,
        219
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  100,
                  101,
                  101,
                  109,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "tokenBridgeWrappedMint",
          "writable": true
        },
        {
          "name": "relayerTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "config"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenBridgeWrappedMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "deposit",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  99,
                  101,
                  105,
                  118,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "vaaHash"
              }
            ]
          }
        },
        {
          "name": "tokenBridgeWrappedMeta",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "tokenBridgeWrappedMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "tokenBridgeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeConfig"
        },
        {
          "name": "vaa",
          "docs": [
            "Verified Wormhole message account. The Wormhole program verified",
            "signatures and posted the account data here. Read-only."
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  80,
                  111,
                  115,
                  116,
                  101,
                  100,
                  86,
                  65,
                  65
                ]
              },
              {
                "kind": "arg",
                "path": "vaaHash"
              }
            ],
            "program": {
              "kind": "account",
              "path": "wormholeProgram"
            }
          }
        },
        {
          "name": "tokenBridgeClaim",
          "writable": true
        },
        {
          "name": "tokenBridgeForeignEndpoint"
        },
        {
          "name": "tokenBridgeMintAuthority"
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated Token program."
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "wormholeProgram",
          "docs": [
            "Wormhole program."
          ],
          "address": "3u8hJUVTA4jH1wYAyUur7FFZVQ8H635K3tSHHF4ssjQ5"
        },
        {
          "name": "tokenBridgeProgram",
          "docs": [
            "Token Bridge program."
          ],
          "address": "DZnkkTmCiFWfYTfT41X3Rd1kDgozqzxWaHqsw6W4x2oe"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Rent sysvar."
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vaaHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "receivedDeposit",
      "discriminator": [
        194,
        3,
        166,
        83,
        137,
        235,
        240,
        91
      ]
    },
    {
      "name": "redeemer",
      "discriminator": [
        41,
        191,
        197,
        8,
        98,
        64,
        17,
        99
      ]
    },
    {
      "name": "vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ownerOnly",
      "msg": "Invalid owner"
    },
    {
      "code": 6001,
      "name": "invalidMessage",
      "msg": "Vault was shutdown"
    },
    {
      "code": 6002,
      "name": "invalidTokenBridgeMintAuthority",
      "msg": "Invalid token bridge mint authority"
    },
    {
      "code": 6003,
      "name": "invalidTokenBridgeForeignEndpoint",
      "msg": "Invalid token bridge foreign endpoint"
    },
    {
      "code": 6004,
      "name": "invalidTransferToAddress",
      "msg": "Invalid transfer to address"
    },
    {
      "code": 6005,
      "name": "invalidTransferToChain",
      "msg": "Invalid transfer to chain"
    },
    {
      "code": 6006,
      "name": "invalidTransferTokenChain",
      "msg": "Invalid transfer token chain"
    },
    {
      "code": 6007,
      "name": "invalidTokenBridgeConfig",
      "msg": "Invalid token bridge config"
    },
    {
      "code": 6008,
      "name": "alreadyRedeemed",
      "msg": "Already redeemed"
    },
    {
      "code": 6009,
      "name": "invalidPayerAta",
      "msg": "Invalid payer ATA"
    },
    {
      "code": 6010,
      "name": "invalidVaultAddress",
      "msg": "Invalid vault address"
    },
    {
      "code": 6011,
      "name": "depositAlreadyProcessed",
      "msg": "Deposit already processed"
    }
  ],
  "types": [
    {
      "name": "inboundTokenBridgeAddresses",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "custodySigner",
            "type": "pubkey"
          },
          {
            "name": "mintAuthority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "receivedDeposit",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wormholeMessageHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "vaultAddress",
            "type": "pubkey"
          },
          {
            "name": "processed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "redeemer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tokenBridge",
            "type": {
              "defined": {
                "name": "inboundTokenBridgeAddresses"
              }
            }
          }
        ]
      }
    },
    {
      "name": "vault",
      "serialization": "bytemuckunsafe",
      "repr": {
        "kind": "rust",
        "packed": true
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "indexBuffer",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "sharesBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "key",
            "type": "pubkey"
          },
          {
            "name": "underlyingMint",
            "type": "pubkey"
          },
          {
            "name": "underlyingTokenAcc",
            "type": "pubkey"
          },
          {
            "name": "underlyingDecimals",
            "type": "u8"
          },
          {
            "name": "accountant",
            "type": "pubkey"
          },
          {
            "name": "totalDebt",
            "type": "u64"
          },
          {
            "name": "totalShares",
            "type": "u64"
          },
          {
            "name": "minimumTotalIdle",
            "type": "u64"
          },
          {
            "name": "totalIdle",
            "type": "u64"
          },
          {
            "name": "depositLimit",
            "type": "u64"
          },
          {
            "name": "userDepositLimit",
            "type": "u64"
          },
          {
            "name": "minUserDeposit",
            "type": "u64"
          },
          {
            "name": "strategiesAmount",
            "type": "u64"
          },
          {
            "name": "isShutdown",
            "type": "bool"
          },
          {
            "name": "kycVerifiedOnly",
            "type": "bool"
          },
          {
            "name": "directDepositEnabled",
            "type": "bool"
          },
          {
            "name": "whitelistedOnly",
            "type": "bool"
          },
          {
            "name": "directWithdrawEnabled",
            "type": "bool"
          },
          {
            "name": "profitMaxUnlockTime",
            "type": "u64"
          },
          {
            "name": "fullProfitUnlockDate",
            "type": "u64"
          },
          {
            "name": "profitUnlockingRate",
            "type": "u64"
          },
          {
            "name": "lastProfitUpdate",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
