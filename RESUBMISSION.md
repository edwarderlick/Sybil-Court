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
- [CASE-0002](https://sybil-court.vercel.app/cases/CASE-0002) — signed; signer matches target; Contested verdict (6,326 characters) names the stored signature. Judge tx `0x6694e191bd69387bdd610e3aecf80a8837d9e938b43a7a2b8f2ab499b78a281b`.

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

**Settlement proofs** are on the previous bonded contract `0x573ae3ba443fc3b5bAA52b9B1030c4eA0c0cf69c` (same economics; the live app does not read it):

| Case | Consequence |
|---|---|
| CASE-0001 Eligible | bond returned as credit; `is_eligible(Vitalik)` true |
| CASE-0002 Ineligible | 0.01 GEN in treasury |
| CASE-0003 Contested + appeal Contested | both bonds returned as credits |

The current contract has the same settlement code. Its judged example is Contested (bond still locked, window open). It has not produced Eligible or Ineligible yet.

## 3. The interface matches the implemented economics

**Feedback:** the UI promised slash / forfeit while the old contract only recorded a number.

**What changed**

- Submit and appeal send `msg.value`. The docket shows **locked / returned (credit) / slashed to treasury**, not “will be slashed.”
- Eligible registry is **On-chain Eligible** or **Not listed**, from `is_eligible`.
- Appeal CTA appears only when the first outcome is Contested and the window is open. Required stake is 2×.
- Copy states that credits may not pay out natively on Studio.
- Footer and case pages print the **current** contract address.

Judgment rules did not change. The full written verdict is still stored untruncated and is expandable on the docket.
