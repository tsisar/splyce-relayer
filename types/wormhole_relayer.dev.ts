/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/wormhole_relayer.json`.
 */
export type WormholeRelayer = {
  "address": "5rZjdjjQf3pmfRGEK3AaG56Z5TGPDb2jLiv8uh1v4PXi",
  "metadata": {
    "name": "wormholeRelayer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "docs": [
    "Wormhole relayer program module for managing cross-chain vault deposits"
  ],
  "instructions": [
    {
      "name": "addSourceAddress",
      "docs": [
        "Add a source address to the whitelist"
      ],
      "discriminator": [
        207,
        181,
        71,
        20,
        154,
        146,
        70,
        6
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "address",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "addSourceChain",
      "docs": [
        "Add a source chain to the whitelist"
      ],
      "discriminator": [
        26,
        58,
        148,
        88,
        190,
        27,
        2,
        144
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "chainId",
          "type": "u16"
        }
      ]
    },
    {
      "name": "addVaultToWhitelist",
      "docs": [
        "Add a vault to the whitelist"
      ],
      "discriminator": [
        181,
        195,
        115,
        155,
        188,
        60,
        56,
        106
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "vault",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "executeDeposit",
      "docs": [
        "Execute a deposit into the vault based on VAA"
      ],
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
          "docs": [
            "The recipient who will receive vault shares",
            "Must match the recipient specified in the deposit record"
          ],
          "writable": true
        },
        {
          "name": "config",
          "docs": [
            "Relayer configuration containing protocol settings"
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
          "name": "deposit",
          "docs": [
            "The deposit record created during the receive instruction",
            "This account will be closed and rent returned to the payer"
          ],
          "writable": true
        },
        {
          "name": "recipientSharesAccount",
          "docs": [
            "The recipient's share token account that will receive vault shares",
            "Will be created if it doesn't exist"
          ],
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
          "docs": [
            "The target vault account that will receive the deposit",
            "Must match the vault address in the deposit record"
          ],
          "writable": true
        },
        {
          "name": "accountant",
          "docs": [
            "The accountant program that handles fee calculations for the vault",
            "Must match the accountant set in the vault"
          ],
          "writable": true
        },
        {
          "name": "accountantRecipient",
          "docs": [
            "The accountant's share token account for receiving fees"
          ],
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
          "docs": [
            "The vault's token account holding underlying tokens"
          ],
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
          "docs": [
            "The vault's share token mint"
          ],
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
          "docs": [
            "The underlying token mint (must match the deposit token)"
          ],
          "writable": true
        },
        {
          "name": "userData",
          "docs": [
            "The user data account for tracking vault deposits"
          ],
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
          "docs": [
            "KYC verification account for the payer"
          ],
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
          "name": "relayerRole",
          "docs": [
            "Relayer role verification account for the payer"
          ],
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
                  7,
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
          "docs": [
            "The relayer's token account holding the received tokens"
          ],
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
          "docs": [
            "The account paying for transaction fees and rent"
          ],
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
          "address": "327rW4RbawrRdwwS65Lfni4j51PVgWQWg2bg8Dzb3ePS"
        },
        {
          "name": "accessControl",
          "docs": [
            "Access Control program"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
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
      "name": "initTokenAccounts",
      "docs": [
        "Initialize token accounts for relayer operations"
      ],
      "discriminator": [
        18,
        116,
        17,
        220,
        17,
        174,
        229,
        193
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "Account paying for transaction fees and rent"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "Redeemer configuration containing protocol settings"
          ],
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
          "docs": [
            "The wrapped token mint for which accounts are being initialized"
          ],
          "writable": true
        },
        {
          "name": "relayerTokenAccount",
          "docs": [
            "The main token account where cross-chain tokens will be received",
            "This account is owned by the redeemer"
          ],
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
          "name": "relayerFeeTokenAccount",
          "docs": [
            "The fee collection token account for storing processing fees",
            "This account is owned by the redeemer and has a PDA address"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenBridgeWrappedMint"
              }
            ]
          }
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
      "args": []
    },
    {
      "name": "initVaultWhitelist",
      "docs": [
        "Initialize the vault whitelist with validation options"
      ],
      "discriminator": [
        197,
        189,
        126,
        162,
        1,
        189,
        227,
        100
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that will be set as the authority for the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being initialized"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program for account creation"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "validateSourceChains",
          "type": "bool"
        },
        {
          "name": "validateSourceAddresses",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the relayer program",
        "",
        "# Arguments",
        "* `ctx` - The context containing initialization accounts",
        "",
        "# Returns",
        "* `Result<()>` - Operation result"
      ],
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
          "docs": [
            "The account that will be set as the program owner",
            "This account pays for initialization and will have administrative privileges"
          ],
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
      "docs": [
        "Receive a cross-chain VAA message"
      ],
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
          "docs": [
            "Account paying for transaction fees and rent"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "docs": [
            "Relayer configuration containing protocol settings"
          ],
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
          "docs": [
            "The wrapped token mint corresponding to the token being transferred"
          ],
          "writable": true
        },
        {
          "name": "relayerTokenAccount",
          "docs": [
            "The relayer's token account that will temporarily hold the tokens"
          ],
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
          "name": "relayerFeeTokenAccount",
          "docs": [
            "The fee collection token account where processing fees are stored"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  102,
                  101,
                  101,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenBridgeWrappedMint"
              }
            ]
          }
        },
        {
          "name": "deposit",
          "docs": [
            "New deposit record created to track this cross-chain deposit"
          ],
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
          "docs": [
            "Metadata for the wrapped token"
          ],
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
          "name": "tokenBridgeConfig",
          "docs": [
            "Token Bridge configuration"
          ]
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
          "docs": [
            "Token Bridge claim account for tracking completed transfers"
          ],
          "writable": true
        },
        {
          "name": "tokenBridgeForeignEndpoint",
          "docs": [
            "Foreign chain endpoint registration with Token Bridge"
          ]
        },
        {
          "name": "tokenBridgeMintAuthority",
          "docs": [
            "Token Bridge mint authority for wrapped tokens"
          ]
        },
        {
          "name": "vaultWhitelist",
          "docs": [
            "Optional vault whitelist account for security validation"
          ],
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                72,
                33,
                56,
                147,
                95,
                54,
                215,
                229,
                40,
                214,
                144,
                163,
                214,
                253,
                77,
                255,
                119,
                57,
                19,
                188,
                216,
                41,
                90,
                17,
                134,
                90,
                43,
                206,
                212,
                132,
                43,
                213
              ]
            }
          }
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
    },
    {
      "name": "removeSourceAddress",
      "docs": [
        "Remove a source address from the whitelist"
      ],
      "discriminator": [
        181,
        129,
        154,
        111,
        28,
        13,
        42,
        67
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "address",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "removeSourceChain",
      "docs": [
        "Remove a source chain from the whitelist"
      ],
      "discriminator": [
        21,
        19,
        95,
        21,
        73,
        116,
        87,
        245
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "chainId",
          "type": "u16"
        }
      ]
    },
    {
      "name": "removeVaultFromWhitelist",
      "docs": [
        "Remove a vault from the whitelist"
      ],
      "discriminator": [
        119,
        86,
        245,
        202,
        78,
        4,
        45,
        100
      ],
      "accounts": [
        {
          "name": "admin",
          "docs": [
            "Admin account that must be the authority on the whitelist"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "adminRole",
          "docs": [
            "Role account verifying the admin has RelayerAdmin permissions"
          ],
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
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "vaultWhitelist",
          "docs": [
            "The vault whitelist account being managed"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "vault",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "returnDeposit",
      "docs": [
        "Return deposit to original chain if necessary"
      ],
      "discriminator": [
        166,
        248,
        12,
        232,
        72,
        180,
        30,
        189
      ],
      "accounts": [
        {
          "name": "recipient",
          "docs": [
            "The recipient who will receive the returned tokens",
            "Must match the recipient specified in the deposit record"
          ],
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "docs": [
            "The recipient's token account that will receive the returned tokens"
          ],
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
          "name": "redeemer",
          "docs": [
            "Redeemer configuration containing protocol settings"
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
          "name": "deposit",
          "docs": [
            "The deposit record that will be returned",
            "Must not have been processed already"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "The vault address from the deposit record",
            "Used for validation to check if the vault can accept the deposit"
          ]
        },
        {
          "name": "underlyingMint",
          "docs": [
            "The token mint for the deposit"
          ],
          "writable": true
        },
        {
          "name": "relayerTokenAccount",
          "docs": [
            "The relayer's token account holding the deposit tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "redeemer"
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
          "docs": [
            "Account paying for transaction fees"
          ],
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
          "address": "327rW4RbawrRdwwS65Lfni4j51PVgWQWg2bg8Dzb3ePS"
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
      "name": "setRedeemerFee",
      "docs": [
        "Set the fee for redeemers of cross-chain deposits"
      ],
      "discriminator": [
        25,
        85,
        220,
        23,
        146,
        17,
        47,
        9
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The admin account with the authority to set fees"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "roles",
          "docs": [
            "Role account verifying the signer has RelayerAdmin permissions"
          ],
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
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "config",
          "docs": [
            "Redeemer configuration to update with the new fee"
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
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unwrapDepositToken",
      "docs": [
        "Unwrap deposited tokens after cross-chain transfer"
      ],
      "discriminator": [
        74,
        171,
        211,
        242,
        170,
        185,
        128,
        251
      ],
      "accounts": [
        {
          "name": "redeemer",
          "docs": [
            "Redeemer configuration containing protocol settings"
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
          "name": "deposit",
          "docs": [
            "The deposit record to be processed",
            "Must not have been processed already"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "The target vault account for verification"
          ],
          "writable": true
        },
        {
          "name": "wrappedUnderlyingMint",
          "docs": [
            "The wrapped token mint received from the Token Bridge"
          ],
          "writable": true
        },
        {
          "name": "underlyingMint",
          "docs": [
            "The native token mint required by the vault"
          ],
          "writable": true
        },
        {
          "name": "wrappedTokenAccount",
          "docs": [
            "The wrapped token account holding the tokens to be swapped"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "redeemer"
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
                "path": "wrappedUnderlyingMint"
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
          "name": "unwrappedTokenAccount",
          "docs": [
            "The native token account to receive swapped tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "redeemer"
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
          "name": "tickArray0",
          "docs": [
            "First tick array for Whirlpool"
          ],
          "writable": true
        },
        {
          "name": "tickArray1",
          "docs": [
            "Second tick array for Whirlpool"
          ],
          "writable": true
        },
        {
          "name": "tickArray2",
          "docs": [
            "Third tick array for Whirlpool"
          ],
          "writable": true
        },
        {
          "name": "tokenVaultA",
          "docs": [
            "Whirlpool token vault A"
          ],
          "writable": true
        },
        {
          "name": "tokenVaultB",
          "docs": [
            "Whirlpool token vault B"
          ],
          "writable": true
        },
        {
          "name": "oracle",
          "docs": [
            "Oracle account for the Whirlpool"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "whirlpool"
              }
            ],
            "program": {
              "kind": "account",
              "path": "whirlpoolProgram"
            }
          }
        },
        {
          "name": "signer",
          "docs": [
            "Account paying for transaction fees"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "whirlpool",
          "docs": [
            "Whirlpool pool account to swap through"
          ],
          "writable": true
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
          "address": "327rW4RbawrRdwwS65Lfni4j51PVgWQWg2bg8Dzb3ePS"
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program."
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "whirlpoolProgram",
          "docs": [
            "Whirlpool program"
          ],
          "address": "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc"
        }
      ],
      "args": [
        {
          "name": "otherAmountThreshold",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawFee",
      "docs": [
        "Withdraw accumulated fees from the relayer"
      ],
      "discriminator": [
        14,
        122,
        231,
        218,
        31,
        238,
        223,
        150
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The admin account with the authority to withdraw fees"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "roles",
          "docs": [
            "Role account verifying the signer has RelayerAdmin permissions"
          ],
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
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  8,
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
          "name": "redeemer",
          "docs": [
            "Redeemer configuration containing protocol settings"
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
          "name": "feeRecipientTokenAccount",
          "docs": [
            "The fee collection token account holding accumulated fees"
          ],
          "writable": true
        },
        {
          "name": "destinationTokenAccount",
          "docs": [
            "The destination account to receive the withdrawn fees"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Token program."
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "accessControl",
          "docs": [
            "Access control program for role verification"
          ],
          "address": "GrjK4kFoXgc53scE6M56E9MYFQHQ9REwjDEJgRwmJ7RP"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
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
      "name": "userRole",
      "discriminator": [
        62,
        252,
        194,
        137,
        183,
        165,
        147,
        28
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
    },
    {
      "name": "vaultWhitelist",
      "discriminator": [
        82,
        19,
        233,
        96,
        174,
        0,
        57,
        17
      ]
    },
    {
      "name": "whirlpool",
      "discriminator": [
        63,
        149,
        209,
        12,
        225,
        128,
        99,
        9
      ]
    }
  ],
  "events": [
    {
      "name": "depositExecuted",
      "discriminator": [
        129,
        128,
        106,
        77,
        252,
        43,
        165,
        41
      ]
    },
    {
      "name": "depositReturned",
      "discriminator": [
        2,
        77,
        168,
        193,
        85,
        51,
        45,
        241
      ]
    },
    {
      "name": "depositTokenUnwrapped",
      "discriminator": [
        163,
        191,
        148,
        213,
        149,
        114,
        209,
        56
      ]
    },
    {
      "name": "feeWithdrawn",
      "discriminator": [
        167,
        107,
        0,
        35,
        67,
        79,
        125,
        118
      ]
    },
    {
      "name": "redeemerFeeSet",
      "discriminator": [
        196,
        201,
        202,
        30,
        49,
        72,
        41,
        224
      ]
    },
    {
      "name": "tokenAccountsInitialized",
      "discriminator": [
        196,
        204,
        78,
        116,
        87,
        132,
        235,
        123
      ]
    },
    {
      "name": "tokenReceived",
      "discriminator": [
        251,
        126,
        204,
        211,
        2,
        159,
        194,
        227
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
      "name": "invalidAccountant",
      "msg": "Invalid accountant"
    },
    {
      "code": 6012,
      "name": "depositAlreadyProcessed",
      "msg": "Deposit already processed"
    },
    {
      "code": 6013,
      "name": "invalidAmount",
      "msg": "Invalid amount"
    },
    {
      "code": 6014,
      "name": "cannotReturnDeposit",
      "msg": "Cannot return deposit"
    },
    {
      "code": 6015,
      "name": "reentrancyDetected",
      "msg": "Reentrancy detected - operation already in progress"
    },
    {
      "code": 6016,
      "name": "invalidNonce",
      "msg": "Invalid nonce value"
    },
    {
      "code": 6017,
      "name": "vaultNotWhitelisted",
      "msg": "Vault not in whitelist"
    },
    {
      "code": 6018,
      "name": "sourceChainNotAllowed",
      "msg": "Source chain not allowed"
    },
    {
      "code": 6019,
      "name": "sourceAddressNotAllowed",
      "msg": "Source address not allowed"
    }
  ],
  "types": [
    {
      "name": "depositExecuted",
      "docs": [
        "Emitted when a cross-chain deposit is executed into a vault."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipient",
            "docs": [
              "The recipient account that initiated the deposit"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultAddress",
            "docs": [
              "The vault where tokens were deposited"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens deposited"
            ],
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint address of the deposited token"
            ],
            "type": "pubkey"
          },
          {
            "name": "wormholeMessageHash",
            "docs": [
              "The hash of the Wormhole message that triggered this deposit"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the deposit was executed"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositReturned",
      "docs": [
        "Emitted when a deposit is returned to the original sender.",
        "This happens when a deposit cannot be processed or is rejected."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipient",
            "docs": [
              "The recipient account receiving the returned tokens"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultAddress",
            "docs": [
              "The vault address that rejected the deposit"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens returned"
            ],
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint address of the returned token"
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the deposit was returned"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "depositTokenUnwrapped",
      "docs": [
        "Emitted when wrapped deposit tokens are unwrapped to the native token."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "depositKey",
            "docs": [
              "The deposit record account key"
            ],
            "type": "pubkey"
          },
          {
            "name": "amountWrapped",
            "docs": [
              "The amount of wrapped tokens converted"
            ],
            "type": "u64"
          },
          {
            "name": "tokenWrapped",
            "docs": [
              "The wrapped token mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "amountUnwrapped",
            "docs": [
              "The amount of unwrapped (native) tokens received"
            ],
            "type": "u64"
          },
          {
            "name": "tokenUnwrapped",
            "docs": [
              "The unwrapped (native) token mint address"
            ],
            "type": "pubkey"
          },
          {
            "name": "aToB",
            "docs": [
              "Direction of the swap (true if A to B, false if B to A)"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "feeWithdrawn",
      "docs": [
        "Emitted when accumulated fees are withdrawn by the authority."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "docs": [
              "The amount of fees withdrawn"
            ],
            "type": "u64"
          },
          {
            "name": "destination",
            "docs": [
              "The destination account receiving the fees"
            ],
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the withdrawal occurred"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "inboundTokenBridgeAddresses",
      "docs": [
        "Stores key addresses from the Token Bridge for inbound token transfers.",
        "",
        "This structure contains the program PDAs needed to interact with",
        "the Wormhole Token Bridge when receiving tokens from other chains."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "docs": [
              "Token Bridge config account"
            ],
            "type": "pubkey"
          },
          {
            "name": "custodySigner",
            "docs": [
              "Token Bridge custody signer PDA"
            ],
            "type": "pubkey"
          },
          {
            "name": "mintAuthority",
            "docs": [
              "Token Bridge mint authority PDA"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "receivedDeposit",
      "docs": [
        "Represents a cross-chain deposit received via Wormhole.",
        "",
        "This account tracks the status of deposits coming from other chains,",
        "storing the necessary information to process them into Solana vaults."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wormholeMessageHash",
            "docs": [
              "Hash of the Wormhole VAA message that triggered this deposit"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "docs": [
              "Amount of tokens being deposited"
            ],
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "docs": [
              "Mint address of the token being deposited"
            ],
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "docs": [
              "Recipient address that should receive the deposit or shares"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultAddress",
            "docs": [
              "Target vault address for the deposit"
            ],
            "type": "pubkey"
          },
          {
            "name": "processed",
            "docs": [
              "Whether the deposit has been processed"
            ],
            "type": "bool"
          },
          {
            "name": "nonce",
            "docs": [
              "Unique nonce for this transaction"
            ],
            "type": "u32"
          },
          {
            "name": "sourceChain",
            "docs": [
              "Chain ID of the source chain"
            ],
            "type": "u16"
          },
          {
            "name": "sourceAddress",
            "docs": [
              "Address on the source chain that initiated the deposit"
            ],
            "type": "bytes"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the deposit was received"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "redeemer",
      "docs": [
        "Central authority account for the Wormhole relayer program.",
        "",
        "Manages cross-chain deposit processing, reentrancy protection,",
        "and fee configuration for the relayer service."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Owner/authority of the redeemer"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "tokenBridge",
            "docs": [
              "Token Bridge addresses for cross-chain operations"
            ],
            "type": {
              "defined": {
                "name": "inboundTokenBridgeAddresses"
              }
            }
          },
          {
            "name": "processingFeeBps",
            "docs": [
              "Processing fee in basis points (e.g., 100 = 1%)"
            ],
            "type": "u64"
          },
          {
            "name": "isProcessing",
            "docs": [
              "Reentrancy guard to prevent concurrent processing"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "redeemerFeeSet",
      "docs": [
        "Emitted when the redeemer fee percentage is updated."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "docs": [
              "The new fee in basis points (e.g., 100 = 1%)"
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the fee was set"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenAccountsInitialized",
      "docs": [
        "Emitted when token accounts are initialized for the relayer."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenBridgeWrappedMint",
            "docs": [
              "The wrapped token mint from the token bridge"
            ],
            "type": "pubkey"
          },
          {
            "name": "relayerTokenAccount",
            "docs": [
              "The relayer's main token account"
            ],
            "type": "pubkey"
          },
          {
            "name": "relayerFeeTokenAccount",
            "docs": [
              "The relayer's fee collection token account"
            ],
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenReceived",
      "docs": [
        "Emitted when tokens are received from another chain via Wormhole."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipient",
            "docs": [
              "The recipient account that will receive the tokens"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultAddress",
            "docs": [
              "The target vault address for the deposit"
            ],
            "type": "pubkey"
          },
          {
            "name": "amount",
            "docs": [
              "The amount of tokens received"
            ],
            "type": "u64"
          },
          {
            "name": "feeAmount",
            "docs": [
              "The fee amount deducted from the received tokens"
            ],
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "docs": [
              "The mint address of the received token"
            ],
            "type": "pubkey"
          },
          {
            "name": "wormholeMessageHash",
            "docs": [
              "The hash of the Wormhole message that triggered this event"
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "timestamp",
            "docs": [
              "Unix timestamp when the tokens were received"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userRole",
      "docs": [
        "User role account that tracks a specific role assignment.",
        "",
        "This account represents the assignment of a specific role to a specific user.",
        "The account address is derived as a PDA from the user's public key and the role ID."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hasRole",
            "docs": [
              "Whether the user has the role (true) or not (false)"
            ],
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "vault",
      "docs": [
        "The main vault state that manages user deposits, withdrawals, and strategy allocations.",
        "",
        "This struct represents a tokenized vault that:",
        "- Accepts deposits in an underlying token",
        "- Issues shares representing vault ownership",
        "- Allocates funds to various investment strategies",
        "- Manages fees and profit distribution",
        "- Enforces access controls and limits"
      ],
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
          },
          {
            "name": "initialSharePrice",
            "type": "u64"
          },
          {
            "name": "lastFeeAccrualTs",
            "docs": [
              "Last time (unix ts) a streaming-fee inflation was applied."
            ],
            "type": "u64"
          },
          {
            "name": "managementFeeRate",
            "docs": [
              "Annual management-fee rate, fixed-point with 1e7 precision.",
              "2 % = 200_000   (100 % = 10_000_000)"
            ],
            "type": "u64"
          },
          {
            "name": "pendingManagementFeeRate",
            "docs": [
              "Pending management fee rate that will take effect after the time delay"
            ],
            "type": "u64"
          },
          {
            "name": "feeUpdateTime",
            "docs": [
              "Timestamp when the pending fee rate should take effect"
            ],
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "vaultWhitelist",
      "docs": [
        "Maintains a whitelist of approved vaults, source chains, and source addresses",
        "for enhanced security in cross-chain operations.",
        "",
        "This account provides security controls to limit which vaults can receive",
        "cross-chain deposits and from which chains or addresses deposits can originate.",
        "When empty, all vaults/chains/addresses are allowed; when populated, only",
        "explicitly whitelisted entities can interact with the system."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The authority that can manage the whitelist"
            ],
            "type": "pubkey"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          },
          {
            "name": "validateSourceChains",
            "docs": [
              "Whether to validate source chains",
              "If true, only chains in allowed_source_chains will be accepted"
            ],
            "type": "bool"
          },
          {
            "name": "validateSourceAddresses",
            "docs": [
              "Whether to validate source addresses",
              "If true, only addresses in allowed_source_addresses will be accepted"
            ],
            "type": "bool"
          },
          {
            "name": "whitelistedVaults",
            "docs": [
              "List of whitelisted vaults (addresses that can receive deposits)",
              "If empty, all vaults are allowed; if populated, only listed vaults can receive deposits"
            ],
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowedSourceChains",
            "docs": [
              "List of allowed source chains (Wormhole chain IDs)",
              "If empty, all chains are allowed; if populated, only listed chains can send deposits"
            ],
            "type": {
              "vec": "u16"
            }
          },
          {
            "name": "allowedSourceAddresses",
            "docs": [
              "List of allowed source addresses (32-byte addresses from source chains)",
              "If empty, all addresses are allowed; if populated, only listed addresses can send deposits"
            ],
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          }
        ]
      }
    },
    {
      "name": "whirlpool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "whirlpoolsConfig",
            "type": "pubkey"
          },
          {
            "name": "whirlpoolBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "tickSpacing",
            "type": "u16"
          },
          {
            "name": "tickSpacingSeed",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "feeRate",
            "type": "u16"
          },
          {
            "name": "protocolFeeRate",
            "type": "u16"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "sqrtPrice",
            "type": "u128"
          },
          {
            "name": "tickCurrentIndex",
            "type": "i32"
          },
          {
            "name": "protocolFeeOwedA",
            "type": "u64"
          },
          {
            "name": "protocolFeeOwedB",
            "type": "u64"
          },
          {
            "name": "tokenMintA",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultA",
            "type": "pubkey"
          },
          {
            "name": "feeGrowthGlobalA",
            "type": "u128"
          },
          {
            "name": "tokenMintB",
            "type": "pubkey"
          },
          {
            "name": "tokenVaultB",
            "type": "pubkey"
          },
          {
            "name": "feeGrowthGlobalB",
            "type": "u128"
          },
          {
            "name": "rewardLastUpdatedTimestamp",
            "type": "u64"
          },
          {
            "name": "rewardInfos",
            "type": {
              "array": [
                {
                  "defined": {
                    "name": "whirlpoolRewardInfo"
                  }
                },
                3
              ]
            }
          }
        ]
      }
    },
    {
      "name": "whirlpoolRewardInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "emissionsPerSecondX64",
            "type": "u128"
          },
          {
            "name": "growthGlobalX64",
            "type": "u128"
          }
        ]
      }
    }
  ]
};
