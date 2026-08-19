# Resubmission notes

For the steward. Product facts only. The live app is [https://sybil-court.vercel.app](https://sybil-court.vercel.app). It reads **`0x114F72F1b65f60d8ed9244B573F0c7F3a980814B`**.

## 1. Evidence / wallet control is better bound

**Feedback:** arbitrary public pages are not authenticated; wallet control is weakly bound.

**What changed**

- Submit can attach an optional **EIP-191 control statement**. The injected wallet signs a message that names the contract, policy id, target wallet, and signer.
- The contract stores `message + signature + signer` on the case and returns them from `get_case`.
- If a statement is present, the **written verdict must cite it**: signer, whether that string equals the target, and the honest limit (key control only).
- Public pages are still fetched and labeled `SOURCE` / `FETCH_THIN` / `FETCH_FAILED`. Nothing is invented to fill a failed page.

**What this does not claim**

- The contract does **not** recover the signer on-chain. It stores the submitted bytes.
- A signature is **not** legal identity, uniqueness, or Eligible.
- If the connected key is not the target wallet, the UI says the target is not bound.

**Proof on the current contract**

- [CASE-0001](https://sybil-court.vercel.app/cases/CASE-0001) — unsigned filing still works (`control_statement.present = false`).
- [CASE-0002](https://sybil-court.vercel.app/cases/CASE-0002) — signed; signer matches target; Contested verdict names the stored signature. Judge tx `0x6694e191bd69387bdd610e3aecf80a8837d9e938b43a7a2b8f2ab499b78a281b`.

## 2. The outcome has a real consequence

**Feedback:** a label without settlement is not a court.

**What changed**

- `submit_case` and `file_appeal` are **payable**. Minimum submit bond is **0.01 GEN**. Appeal is **2×**, only after Contested, only inside a **7-day** window.
- After `judge_case`:
  - Eligible → credit to the submitter + `eligible_wallets` registry
  - Ineligible → slash to the contract treasury
  - Contested → lock + appeal window
- After `judge_appeal`, both bonds are refunded, or the submitter is slashed and the appellant is refunded.

**Studio limit:** refunds are **on-contract credits**. `withdraw()` may not pay native GEN on Studio. That is documented in the UI and here. It is not a hidden native payout.

**Settlement on the current contract** (`0x114F72F1b65f60d8ed9244B573F0c7F3a980814B`), which is what the live app reads:

| Case | Outcome | Consequence |
|---|---|---|
| [CASE-0006](https://sybil-court.vercel.app/cases/CASE-0006) | Eligible | bond returned as credit; `is_eligible(0xd8dA6BF2…A96045)` true |
| [CASE-0004](https://sybil-court.vercel.app/cases/CASE-0004) | Ineligible | 0.01 GEN slashed to treasury; wallet not listed |
| [CASE-0002](https://sybil-court.vercel.app/cases/CASE-0002) | Contested | bond still locked; 7-day appeal window open |

Judge txs: Eligible `0x363077d699b5c9db5d3eb0089bbca9b24d0b6aa871f4430799c51a4c42886c97`. Ineligible `0xe58a514ba9b0566b3a12d3d7506df99399c3704dcf07b9d607ad6fcdb7a062e8`.

A settled 2× appeal (both credits returned) still lives on the previous bonded contract `0x573ae3ba…`. The live app does not read that address.

## 3. The interface matches the implemented economics

**Feedback:** the UI promised slash / forfeit while the old contract only recorded a number.

**What changed**

- Submit and appeal send `msg.value`. The docket shows **locked / returned (credit) / slashed to treasury**, not “will be slashed.”
- Eligible registry is **On-chain Eligible** or **Not listed**, from `is_eligible`.
- Appeal CTA appears only when the first outcome is Contested and the window is open. Required stake is 2×.
- Copy states that credits may not pay out natively on Studio.
- Footer and case pages print the **current** contract address.

Judgment rules did not change. The full written verdict is still stored untruncated and is expandable on the docket.
