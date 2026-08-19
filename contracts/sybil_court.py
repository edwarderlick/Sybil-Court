# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

"""Sybil Court — Studio / Bradbury Intelligent Contract.

Stores policies, cases, verdicts, and appeals. judge_case / judge_appeal
fetch public web evidence and settle with live equivalence helpers.

Live-docs notes used here (docs.genlayer.com, last_updated 2026-06-11):
- Persistent fields are class annotations; long text is a plain `str`.
- Collections are TreeMap / DynArray, not dict / list.
- Web I/O is gl.nondet.web.get / request / render and MUST stay inside a
  nondet block. Storage writes happen AFTER that block returns.
- Comparative settlement: gl.eq_principle.prompt_comparative(fn, principle=...)
- Open-ended source-grounded text: gl.eq_principle.prompt_non_comparative(
  fn, task=..., criteria=...)
- Studio has no usable @gl.evm.contract_interface for real history reads.
  Evidence is public web sources + user-submitted links.
"""

from dataclasses import dataclass

from genlayer import *


@allow_storage
@dataclass
class Verdict:
    issued: bool
    outcome: str
    text: str
    vote_summary: str


@allow_storage
@dataclass
class Appeal:
    filed: bool
    filer: Address
    reason: str
    bond_atto: u256
    verdict: Verdict


@allow_storage
@dataclass
class Policy:
    id: str
    publisher: Address
    title: str
    body: str
    project: str
    source: str


@allow_storage
@dataclass
class Case:
    id: str
    submitter: Address
    wallet: str
    policy_id: str
    bond_atto: u256
    status: str
    evidence_blob: str
    verdict: Verdict
    appeal: Appeal
    bond_status: str
    appeal_opens_at: str
    appeal_deadline: str
    control_message: str
    control_signature: str
    control_signer: str


def _empty_verdict() -> Verdict:
    return Verdict(issued=False, outcome="", text="", vote_summary="")


ZERO_ADDRESS = Address("0x0000000000000000000000000000000000000000")


@gl.evm.contract_interface
class _NativeRecipient:
    class View:
        pass

    class Write:
        pass


def _empty_appeal() -> Appeal:
    return Appeal(
        filed=False,
        filer=ZERO_ADDRESS,
        reason="",
        bond_atto=u256(0),
        verdict=_empty_verdict(),
    )


def _normalize_url(raw: str) -> str:
    link = raw.strip().strip("<>\"',;")
    if link.endswith(")") and "(" not in link:
        link = link[:-1]
    if link.endswith("].") or link.endswith("],"):
        link = link[:-2]
    if link.endswith(".") or link.endswith("]"):
        link = link[:-1]
    return link


def _is_http_url(link: str) -> bool:
    return link.startswith("http://") or link.startswith("https://")


def _extract_http_urls(text: str) -> list[str]:
    found: list[str] = []
    start = 0
    lowered = text
    while start < len(lowered):
        http = lowered.find("http://", start)
        https = lowered.find("https://", start)
        if http == -1 and https == -1:
            break
        if http == -1:
            idx = https
        elif https == -1:
            idx = http
        else:
            idx = http if http < https else https
        end = idx
        while end < len(lowered) and lowered[end] not in " \t\r\n<>\"'":
            end += 1
        link = _normalize_url(text[idx:end])
        if _is_http_url(link) and link not in found:
            found.append(link)
        start = end
    return found


def _parse_evidence_links(evidence_blob: str) -> list[str]:
    text = evidence_blob.strip()
    if text == "":
        return []
    links: list[str] = []
    if text.startswith("["):
        import json

        try:
            parsed = json.loads(text)
        except Exception:
            parsed = None
        if isinstance(parsed, list):
            for item in parsed:
                extracted = _extract_http_urls(str(item))
                if len(extracted) == 0:
                    candidate = _normalize_url(str(item))
                    if _is_http_url(candidate):
                        extracted = [candidate]
                for link in extracted:
                    if link not in links:
                        links.append(link)
            if len(links) > 0:
                return links
    for link in _extract_http_urls(text):
        if link not in links:
            links.append(link)
    if len(links) > 0:
        return links
    for line in text.replace(",", "\n").splitlines():
        link = _normalize_url(line)
        if _is_http_url(link) and link not in links:
            links.append(link)
    return links


def _verdict_dict(verdict: Verdict) -> dict:
    return {
        "issued": bool(verdict.issued),
        "outcome": verdict.outcome,
        "text": verdict.text,
        "vote_summary": verdict.vote_summary,
    }


def _appeal_dict(appeal: Appeal) -> dict:
    return {
        "filed": bool(appeal.filed),
        "filer": str(appeal.filer),
        "reason": appeal.reason,
        "bond_atto": str(appeal.bond_atto),
        "verdict": _verdict_dict(appeal.verdict),
    }


def _message_datetime() -> str:
    try:
        raw = gl.message_raw.get("datetime", "")
        return _as_text(raw).strip()
    except Exception:
        return ""


def _parse_iso_datetime(text: str):
    import datetime

    cleaned = text.strip().replace("Z", "+00:00")
    if cleaned == "":
        return None
    try:
        return datetime.datetime.fromisoformat(cleaned)
    except Exception:
        return None


def _now_dt():
    import datetime

    parsed = _parse_iso_datetime(_message_datetime())
    if parsed is not None:
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=datetime.timezone.utc)
        return parsed
    return datetime.datetime.now(datetime.timezone.utc)


def _iso(dt) -> str:
    return dt.isoformat()


def _add_seconds(dt, seconds: int):
    import datetime

    return dt + datetime.timedelta(seconds=seconds)


def _wallet_key(wallet: str) -> str:
    return wallet.strip().lower()


def _wallets_equal(left: str, right: str) -> bool:
    a = _wallet_key(left)
    b = _wallet_key(right)
    return a != "" and a == b


def _control_dict(case: Case) -> dict:
    present = case.control_signature.strip() != ""
    return {
        "present": present,
        "message": case.control_message,
        "signature": case.control_signature,
        "signer": case.control_signer,
        "signer_matches_target": present
        and _wallets_equal(case.control_signer, case.wallet),
        "message_names_wallet": present
        and case.wallet.strip() != ""
        and case.wallet.strip() in case.control_message,
        "message_names_policy": present
        and case.policy_id.strip() != ""
        and case.policy_id.strip() in case.control_message,
    }


def _normalize_control(message: str, signature: str, signer: str) -> tuple[str, str, str]:
    msg = _as_text(message).strip()
    sig = _as_text(signature).strip()
    who = _as_text(signer).strip()
    if msg == "" and sig == "" and who == "":
        return "", "", ""
    if msg == "" or sig == "" or who == "":
        raise gl.vm.UserError(
            "[EXPECTED] Control statement requires message, signature, and signer together"
        )
    if len(msg) > 2048:
        raise gl.vm.UserError("[EXPECTED] Control message is too long")
    if len(sig) > 200:
        raise gl.vm.UserError("[EXPECTED] Control signature is too long")
    if len(who) > 128:
        raise gl.vm.UserError("[EXPECTED] Control signer is too long")
    return msg, sig, who


OUTCOMES = ("Eligible", "Ineligible", "Contested")
FETCH_CHAR_CAP = 5000
MAX_USER_LINKS = 5
MAX_FALLBACK_LINKS = 3
MIN_SUBMIT_BOND = u256(10**16)  # 0.01 GEN
APPEAL_BOND_MULT = u256(2)
APPEAL_WINDOW_SECONDS = 7 * 24 * 60 * 60


def _as_text(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    return str(value)


def _clip_fetch(text: str) -> str:
    if len(text) <= FETCH_CHAR_CAP:
        return text
    return text[:FETCH_CHAR_CAP] + "\n[fetch clipped for prompt budget; stored verdict is not clipped]"


def _normalize_outcome(raw: str) -> str:
    token = raw.strip().lower()
    if token == "eligible":
        return "Eligible"
    if token == "ineligible":
        return "Ineligible"
    return "Contested"


def _parse_json_object(raw) -> dict:
    if isinstance(raw, dict):
        return raw
    text = _as_text(raw)
    first = text.find("{")
    last = text.rfind("}")
    if first == -1 or last == -1 or last <= first:
        return {}
    import json

    try:
        parsed = json.loads(text[first : last + 1])
    except Exception:
        return {}
    if isinstance(parsed, dict):
        return parsed
    return {}


_HEX = "0123456789abcdefABCDEF"
_SOLANA_B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
_EVM_CHAINS = ("ethereum", "base", "arbitrum", "optimism", "zksync", "polygon")


def _is_hex(text: str) -> bool:
    if text == "":
        return False
    for ch in text:
        if ch not in _HEX:
            return False
    return True


def _looks_like_evm_address(wallet: str) -> bool:
    text = wallet.strip()
    if len(text) != 42 or not text.startswith("0x"):
        return False
    return _is_hex(text[2:])


def _looks_like_solana_address(wallet: str) -> bool:
    text = wallet.strip()
    if len(text) < 32 or len(text) > 44:
        return False
    for ch in text:
        if ch not in _SOLANA_B58:
            return False
    return True


def _looks_like_sui_address(wallet: str) -> bool:
    text = wallet.strip()
    if text.startswith("0x") or text.startswith("0X"):
        hexpart = text[2:]
    else:
        hexpart = text
    # Sui / Aptos are 32-byte keys (64 hex). 40 hex is Ethereum, not Sui.
    if len(hexpart) < 41 or len(hexpart) > 64:
        return False
    return _is_hex(hexpart)


def _wallet_fits_chain(wallet: str, chain: str) -> bool:
    if chain in _EVM_CHAINS:
        return _looks_like_evm_address(wallet)
    if chain == "solana":
        return _looks_like_solana_address(wallet)
    if chain == "sui" or chain == "aptos":
        return _looks_like_sui_address(wallet)
    return False


def _phrase_index(haystack: str, phrase: str) -> int:
    pos = 0
    n = len(phrase)
    while True:
        idx = haystack.find(phrase, pos)
        if idx == -1:
            return -1
        before = haystack[idx - 1] if idx > 0 else " "
        after = haystack[idx + n] if idx + n < len(haystack) else " "
        if (not before.isalnum()) and (not after.isalnum()):
            return idx
        pos = idx + 1


# Phrase lists are conservative so ordinary English ("based on", "user base")
# does not flip the fallback set. First occurrence in title+body+user links wins.
# If no phrase matches, wallet shape may still select Solana.
_CHAIN_PHRASES = (
    (
        "solana",
        (
            "solana",
            "solscan",
            "solana.fm",
            "solanafm",
            "explorer.solana",
            "sol airdrop",
            "on solana",
        ),
    ),
    (
        "sui",
        (
            "sui network",
            "sui chain",
            "sui airdrop",
            "sui blockchain",
            "sui mainnet",
            "suiscan",
            "suivision",
            "explorer.sui",
            "on sui",
            "sui",
        ),
    ),
    (
        "aptos",
        (
            "aptos",
            "aptoscan",
            "aptoslabs",
        ),
    ),
    (
        "base",
        (
            "basescan",
            "base chain",
            "base network",
            "base l2",
            "base layer 2",
            "base layer-2",
            "base mainnet",
            "base airdrop",
            "on base",
            "coinbase base",
            "base.org",
            "base sepolia",
            "base ecosystem",
        ),
    ),
    (
        "arbitrum",
        (
            "arbitrum one",
            "arbitrum nova",
            "arbitrum",
            "arbiscan",
            "arb chain",
        ),
    ),
    (
        "optimism",
        (
            "optimistic etherscan",
            "op mainnet",
            "op-mainnet",
            "optimism",
            "op airdrop",
        ),
    ),
    (
        "zksync",
        (
            "zksync era",
            "zk sync era",
            "zk-sync",
            "zksync",
            "zk sync",
            "explorer.zksync",
        ),
    ),
    (
        "polygon",
        (
            "polygon pos",
            "polygon zk",
            "polygonscan",
            "polygon",
        ),
    ),
)

_CHAIN_EXPLORERS = {
    "solana": (
        "https://www.oklink.com/solana/address/",
        "https://solscan.io/account/",
        "https://solana.fm/address/",
    ),
    "sui": (
        "https://www.oklink.com/sui/address/",
        "https://suiscan.xyz/mainnet/account/",
        "https://suivision.xyz/account/",
    ),
    "aptos": (
        "https://www.oklink.com/aptos/address/",
        "https://explorer.aptoslabs.com/account/",
        "https://aptoscan.com/account/",
    ),
    "base": (
        "https://www.oklink.com/base/address/",
        "https://base.blockscout.com/address/",
        "https://basescan.org/address/",
    ),
    "arbitrum": (
        "https://www.oklink.com/arbitrum-one/address/",
        "https://arbitrum.blockscout.com/address/",
        "https://arbiscan.io/address/",
    ),
    "optimism": (
        "https://www.oklink.com/optimism/address/",
        "https://optimism.blockscout.com/address/",
        "https://optimistic.etherscan.io/address/",
    ),
    "zksync": (
        "https://www.oklink.com/zksync/address/",
        "https://zksync.blockscout.com/address/",
        "https://explorer.zksync.io/address/",
    ),
    "polygon": (
        "https://www.oklink.com/polygon/address/",
        "https://polygon.blockscout.com/address/",
        "https://polygonscan.com/address/",
    ),
    "ethereum": (
        "https://www.oklink.com/ethereum/address/",
        "https://eth.blockscout.com/address/",
        "https://etherchain.org/account/",
    ),
}


def _detect_chain_from_text(haystack: str) -> str:
    best_chain = ""
    best_pos = -1
    for chain, phrases in _CHAIN_PHRASES:
        for phrase in phrases:
            pos = _phrase_index(haystack, phrase)
            if pos == -1:
                continue
            if best_pos == -1 or pos < best_pos:
                best_pos = pos
                best_chain = chain
    return best_chain


def _detect_chain(
    policy_title: str, policy_body: str, wallet: str, user_urls: list[str]
) -> str:
    haystack = policy_title + "\n" + policy_body
    for link in user_urls:
        haystack += "\n" + link
    named = _detect_chain_from_text(haystack.lower())
    if named != "":
        return named
    # Policy silent: only infer distinctive non-EVM shapes. 64-hex is
    # Sui-or-Aptos, so do not guess. EVM wallets stay on Ethereum.
    if _looks_like_solana_address(wallet):
        return "solana"
    return "ethereum"


def _public_explorer_urls(wallet: str, chain: str) -> list[str]:
    if not _wallet_fits_chain(wallet, chain):
        return []
    addr = wallet.strip()
    roots = _CHAIN_EXPLORERS.get(chain, _CHAIN_EXPLORERS["ethereum"])
    urls: list[str] = []
    for root in roots:
        urls.append(root + addr)
        if len(urls) >= MAX_FALLBACK_LINKS:
            break
    return urls


def _html_to_readable(text: str) -> str:
    import re

    cleaned = re.sub(r"(?is)<script[^>]*>.*?</script>", " ", text)
    cleaned = re.sub(r"(?is)<style[^>]*>.*?</style>", " ", cleaned)
    cleaned = re.sub(r"(?is)<noscript[^>]*>.*?</noscript>", " ", cleaned)
    cleaned = re.sub(r"(?is)<[^>]+>", " ", cleaned)
    cleaned = (
        cleaned.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&#39;", "'")
        .replace("&quot;", '"')
    )
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def _is_challenge_wall(text: str) -> bool:
    low = text.lower()
    markers = (
        "cf-browser-verification",
        "cdn-cgi/challenge",
        "just a moment...",
        "enable javascript and cookies to continue",
        "checking your browser before accessing",
        "security verification in progress",
        "validating your browser",
        "attention required! | cloudflare",
        "verify you are human",
    )
    for marker in markers:
        if marker in low:
            return True
    return False


def _prepare_source_body(raw: str) -> str:
    readable = _html_to_readable(raw)
    if readable == "":
        readable = raw.strip()
    if _is_challenge_wall(readable) or _is_challenge_wall(raw):
        return (
            "FETCH_THIN challenge/interstitial (Cloudflare or similar); "
            "no usable public content from this URL"
        )
    if len(readable) < 40:
        return "FETCH_THIN almost no readable text after fetch"
    if len(readable) < 120 and "address" in readable.lower():
        return (
            "FETCH_THIN title-only or stub page; address mentioned but no "
            "usable holdings, identity, or activity text"
        )
    return _clip_fetch(readable)


def _fetch_one_url(url: str) -> str:
    try:
        response = gl.nondet.web.get(url)
        status = getattr(response, "status_code", None)
        if status is None:
            status = getattr(response, "status", None)
        body = _as_text(getattr(response, "body", response))
        if status is not None and int(status) >= 400:
            return "FETCH_FAILED " + url + " HTTP " + str(status)
        if body.strip() == "":
            return "FETCH_FAILED " + url + " empty body"
        prepared = _prepare_source_body(body)
        if prepared.startswith("FETCH_"):
            return prepared + "\nURL " + url
        return "SOURCE " + url + "\n" + prepared
    except Exception as get_error:
        try:
            rendered = gl.nondet.web.render(url, mode="html")
            body = _as_text(rendered)
            if body.strip() == "":
                return (
                    "FETCH_FAILED "
                    + url
                    + " get="
                    + _as_text(get_error)
                    + " render=empty"
                )
            prepared = _prepare_source_body(body)
            if prepared.startswith("FETCH_"):
                return prepared + "\nURL " + url
            return "SOURCE_RENDERED " + url + "\n" + prepared
        except Exception as render_error:
            return (
                "FETCH_FAILED "
                + url
                + " get="
                + _as_text(get_error)
                + " render="
                + _as_text(render_error)
            )


def _collect_source_text(packet: dict) -> str:
    parts = [
        "CASE_ID:\n" + packet["case_id"],
        "ROUND:\n" + packet["round"],
        "TARGET_WALLET:\n" + packet["wallet"],
        "POLICY_TITLE:\n" + packet["policy_title"],
        "POLICY_BODY:\n" + packet["policy_body"],
    ]
    if packet["round"] == "appeal":
        parts.append("PRIOR_OUTCOME:\n" + packet["prior_outcome"])
        parts.append("PRIOR_VERDICT:\n" + packet["prior_verdict"])
        parts.append("APPEAL_REASON:\n" + packet["appeal_reason"])

    if packet.get("control_present"):
        match_label = (
            "yes" if packet.get("control_signer_matches_target") else "no"
        )
        names_wallet = "yes" if packet.get("control_message_names_wallet") else "no"
        names_policy = "yes" if packet.get("control_message_names_policy") else "no"
        parts.append(
            "CONTROL_STATEMENT:\n"
            "present: yes\n"
            "signer: "
            + _as_text(packet.get("control_signer", ""))
            + "\n"
            "signer_matches_target: "
            + match_label
            + "\n"
            "message_names_wallet: "
            + names_wallet
            + "\n"
            "message_names_policy: "
            + names_policy
            + "\n"
            "message:\n"
            + _as_text(packet.get("control_message", ""))
            + "\n"
            "signature:\n"
            + _as_text(packet.get("control_signature", ""))
            + "\n"
            "HONEST_LIMIT: This contract stored the submitted EIP-191 personal_sign "
            "bytes. It did not recover the signer on-chain. A matching signer string "
            "means the submitter claimed that key. This proves control of a signing "
            "key only if independently recovered. It does not prove legal identity, "
            "uniqueness, humanity, or any on-chain history."
        )
    else:
        parts.append(
            "CONTROL_STATEMENT:\n"
            "present: no\n"
            "No signed control statement was stored with this case."
        )

    user_urls: list[str] = []
    for link in packet["links"][:MAX_USER_LINKS]:
        if _is_http_url(link) and link not in user_urls:
            user_urls.append(link)

    chain = _detect_chain(
        packet["policy_title"],
        packet["policy_body"],
        packet["wallet"],
        user_urls,
    )
    fallback_urls: list[str] = []
    for link in _public_explorer_urls(packet["wallet"], chain):
        if link not in user_urls and link not in fallback_urls:
            fallback_urls.append(link)

    inventory = ["EVIDENCE_URLS:", "DETECTED_CHAIN: " + chain]
    if len(user_urls) == 0:
        inventory.append("- user: none supplied")
    for link in user_urls:
        inventory.append("- user: " + link)
    if len(fallback_urls) == 0:
        inventory.append(
            "- fallback: none (wallet does not match "
            + chain
            + " address format, or already listed)"
        )
    for link in fallback_urls:
        inventory.append("- fallback explorer (" + chain + "): " + link)
    parts.append("\n".join(inventory))

    urls = user_urls + fallback_urls
    if len(urls) == 0:
        parts.append(
            "FETCHED_EVIDENCE:\nNo user-supplied links and no public explorer URL could be derived."
        )
        return "\n\n".join(parts)

    fetched: list[str] = []
    for url in urls:
        fetched.append(_fetch_one_url(url))
    parts.append("FETCHED_EVIDENCE:\n" + "\n\n".join(fetched))
    return "\n\n".join(parts)


def _store_verdict(slot: Verdict, written: str, decided: dict) -> None:
    slot.issued = True
    slot.outcome = decided["outcome"]
    slot.text = written
    summary = decided["summary"]
    if summary == "":
        summary = "Comparative outcome: " + decided["outcome"]
    slot.vote_summary = summary


VERDICT_TASK = (
    "Write the complete official Sybil Court verdict from the policy, CONTROL_STATEMENT, "
    "and FETCHED_EVIDENCE only. "
    "Use this structure: (1) caption with case id, round, target wallet, policy title; "
    "(2) Control statement — if present, state that wallet control was bound by the stored "
    "signature, name the signer, say whether the signer string equals the target wallet, "
    "and quote the honest limit (key control only, not identity). If absent, say no signed "
    "control statement was stored; "
    "(3) Evidence inventory — one subsection per URL listing fetch status and 2–6 concrete "
    "facts that actually appear in that source; "
    "(4) Policy application — map those cited facts to specific policy clauses; "
    "(5) Gaps — what the policy requires that the sources do not show; "
    "(6) Conclusion. "
    "Cite every URL that was attempted. Quote or closely paraphrase only fetched text. "
    "If a source has substantial relevant content, discuss that content specifically. "
    "If a source is FETCH_FAILED or FETCH_THIN, say so and do not fill the gap. "
    "A stored signature is not uniqueness proof and is not identity. "
    "Never invent transactions, balances, counterparties, clusters, ENS names, or pages."
)

VERDICT_CRITERIA = """
The verdict must be grounded only in the supplied policy text, CONTROL_STATEMENT, and FETCHED_EVIDENCE.
If CONTROL_STATEMENT is present, the verdict must include a control-statement subsection that names the stored signer, states that wallet control was bound by that stored signature, and states that a signature proves key control only — not legal identity, uniqueness, or on-chain history.
If CONTROL_STATEMENT is absent, the verdict must say no signed control statement was stored.
Every attempted URL in EVIDENCE_URLS must be mentioned with its fetch result.
Facts, quotes, names, and numbers must come from fetched source text or the stored control statement bytes.
Do not invent explorer results, balances, transfers, clusters, or identity claims.
Do not treat a signature as Eligible proof or as a unique human.
FETCH_FAILED and FETCH_THIN sources must be labeled as failed or thin.
If any source has real usable content, the verdict must discuss that content specifically rather than treating all evidence as empty.
It must be a full written judgment, not a one-line label.
If the record is incomplete, contradictory, or thin under the policy, the text must say the matter is contested or incomplete.
"""


def _write_full_verdict(packet: dict) -> str:
    def load_sources():
        return _collect_source_text(packet)

    return gl.eq_principle.prompt_non_comparative(
        load_sources,
        task=VERDICT_TASK,
        criteria=VERDICT_CRITERIA,
    )


def _decide_outcome(packet: dict, written_verdict: str) -> dict:
    def analyze():
        sources = _collect_source_text(packet)
        prompt = (
            "You are Sybil Court. Read the policy, fetched evidence, and written verdict. "
            "Return JSON with keys outcome and summary. "
            "outcome must be exactly one of: Eligible, Ineligible, Contested. "
            "Eligible only if fetched sources themselves clearly satisfy the policy's uniqueness / non-sybil test. "
            "Ineligible only if fetched sources themselves clearly show sybil / farming / cluster behavior under the policy. "
            "Contested when any required proof is missing, FETCH_FAILED, FETCH_THIN, off-topic, or contradictory. "
            "Do not upgrade a biographical page, homepage, or explorer interstitial into on-chain proof. "
            "A stored control signature proves claimed key control only. It is never sufficient for Eligible and is not identity. "
            "Do not guess. If supporting source text is not present, outcome is Contested. "
            "summary is one short sentence that cites the strongest fetched fact or the specific gap.\n\n"
            + sources
            + "\n\nWRITTEN_VERDICT:\n"
            + written_verdict
        )
        raw = gl.nondet.exec_prompt(prompt, response_format="json")
        parsed = _parse_json_object(raw)
        outcome = _normalize_outcome(_as_text(parsed.get("outcome", "Contested")))
        summary = _as_text(parsed.get("summary", "")).strip()
        if summary == "":
            summary = (
                "Outcome " + outcome + " from comparative review of fetched sources."
            )
        import json

        return json.dumps({"outcome": outcome, "summary": summary}, sort_keys=True)

    raw = gl.eq_principle.prompt_comparative(
        analyze,
        principle="`outcome` field must be exactly the same. All other fields must be similar.",
    )
    parsed = _parse_json_object(raw)
    return {
        "outcome": _normalize_outcome(_as_text(parsed.get("outcome", "Contested"))),
        "summary": _as_text(parsed.get("summary", "")).strip(),
    }


class SybilCourt(gl.Contract):
    owner: Address
    policies: TreeMap[str, Policy]
    policy_ids: DynArray[str]
    policy_count: u256
    last_policy_id: str
    cases: TreeMap[str, Case]
    case_ids: DynArray[str]
    case_count: u256
    last_case_id: str
    treasury_atto: u256
    credits: TreeMap[str, u256]
    eligible_wallets: TreeMap[str, str]
    eligible_count: u256

    def __init__(self):
        self.owner = gl.message.sender_address
        self.treasury_atto = u256(0)
        self.eligible_count = u256(0)

    def _next_policy_id(self) -> str:
        nxt = int(self.policy_count) + 1
        return "POL-" + str(nxt).zfill(4)

    def _next_case_id(self) -> str:
        nxt = int(self.case_count) + 1
        return "CASE-" + str(nxt).zfill(4)

    def _require_policy(self, policy_id: str) -> None:
        if policy_id not in self.policies:
            raise gl.vm.UserError("[EXPECTED] Unknown policy: " + policy_id)

    def _require_case(self, case_id: str) -> None:
        if case_id not in self.cases:
            raise gl.vm.UserError("[EXPECTED] Unknown case: " + case_id)

    def _credit_of(self, addr_key: str) -> u256:
        if addr_key in self.credits:
            return self.credits[addr_key]
        return u256(0)

    def _add_credit(self, addr: Address, amount: u256) -> None:
        if amount == u256(0):
            return
        key = str(addr)
        self.credits[key] = self._credit_of(key) + amount

    def _register_eligible(self, wallet: str, case_id: str) -> None:
        key = _wallet_key(wallet)
        if key == "":
            return
        if key not in self.eligible_wallets:
            self.eligible_count = self.eligible_count + u256(1)
        self.eligible_wallets[key] = case_id

    def _clear_eligible(self, wallet: str) -> None:
        key = _wallet_key(wallet)
        if key in self.eligible_wallets:
            del self.eligible_wallets[key]
            if self.eligible_count > u256(0):
                self.eligible_count = self.eligible_count - u256(1)

    def _return_bond(self, addr: Address, amount: u256) -> None:
        self._add_credit(addr, amount)

    def _slash_to_treasury(self, amount: u256) -> None:
        self.treasury_atto = self.treasury_atto + amount

    def _settle_first(self, case_id: str) -> None:
        case = self.cases[case_id]
        outcome = case.verdict.outcome
        bond = case.bond_atto
        if outcome == "Eligible":
            self._return_bond(case.submitter, bond)
            self._register_eligible(case.wallet, case_id)
            case.bond_status = "returned"
            return
        if outcome == "Ineligible":
            self._slash_to_treasury(bond)
            self._clear_eligible(case.wallet)
            case.bond_status = "slashed"
            return
        now = _now_dt()
        case.bond_status = "locked"
        case.appeal_opens_at = _iso(now)
        case.appeal_deadline = _iso(_add_seconds(now, APPEAL_WINDOW_SECONDS))

    def _settle_appeal(self, case_id: str) -> None:
        case = self.cases[case_id]
        outcome = case.appeal.verdict.outcome
        submit_bond = case.bond_atto
        appeal_bond = case.appeal.bond_atto
        filer = case.appeal.filer
        if outcome == "Eligible":
            self._return_bond(case.submitter, submit_bond)
            self._return_bond(filer, appeal_bond)
            self._register_eligible(case.wallet, case_id)
            case.bond_status = "returned"
            return
        if outcome == "Ineligible":
            self._slash_to_treasury(submit_bond)
            self._return_bond(filer, appeal_bond)
            self._clear_eligible(case.wallet)
            case.bond_status = "slashed"
            return
        self._return_bond(case.submitter, submit_bond)
        self._return_bond(filer, appeal_bond)
        case.bond_status = "returned"

    def _appeal_window_open(self, case: Case) -> bool:
        if case.verdict.outcome != "Contested":
            return False
        if case.appeal.filed:
            return False
        deadline = _parse_iso_datetime(case.appeal_deadline)
        if deadline is None:
            return False
        now = _now_dt()
        if deadline.tzinfo is None and now.tzinfo is not None:
            import datetime

            deadline = deadline.replace(tzinfo=datetime.timezone.utc)
        return now <= deadline

    @gl.public.write
    def publish_policy(self, title: str, body: str, project: str, source: str) -> None:
        if title.strip() == "" or body.strip() == "":
            raise gl.vm.UserError("[EXPECTED] Policy title and full body are required")
        policy_id = self._next_policy_id()
        self.policies[policy_id] = Policy(
            id=policy_id,
            publisher=gl.message.sender_address,
            title=title,
            body=body,
            project=project,
            source=source,
        )
        self.policy_ids.append(policy_id)
        self.policy_count = self.policy_count + u256(1)
        self.last_policy_id = policy_id

    @gl.public.write.payable
    def submit_case(
        self,
        wallet: str,
        policy_id: str,
        evidence_blob: str,
        bond_atto: u256,
        control_message: str,
        control_signature: str,
        control_signer: str,
    ) -> None:
        wallet_text = _as_text(wallet).strip()
        if wallet_text == "":
            raise gl.vm.UserError("[EXPECTED] Target wallet is required")
        self._require_policy(policy_id)
        paid = gl.message.value
        if paid < MIN_SUBMIT_BOND:
            raise gl.vm.UserError(
                "[EXPECTED] Submit bond must be at least 0.01 GEN (sent as msg.value)"
            )
        if paid < bond_atto:
            raise gl.vm.UserError(
                "[EXPECTED] msg.value is below the declared bond_atto"
            )
        message, signature, signer = _normalize_control(
            control_message, control_signature, control_signer
        )
        case_id = self._next_case_id()
        self.cases[case_id] = Case(
            id=case_id,
            submitter=gl.message.sender_address,
            wallet=wallet_text,
            policy_id=policy_id,
            bond_atto=paid,
            status="submitted",
            evidence_blob=evidence_blob,
            verdict=_empty_verdict(),
            appeal=_empty_appeal(),
            bond_status="locked",
            appeal_opens_at="",
            appeal_deadline="",
            control_message=message,
            control_signature=signature,
            control_signer=signer,
        )
        self.case_ids.append(case_id)
        self.case_count = self.case_count + u256(1)
        self.last_case_id = case_id

    @gl.public.write.payable
    def file_appeal(self, case_id: str, reason: str, bond_atto: u256) -> None:
        self._require_case(case_id)
        if reason.strip() == "":
            raise gl.vm.UserError("[EXPECTED] Appeal reason is required")
        case = self.cases[case_id]
        if case.appeal.filed:
            raise gl.vm.UserError("[EXPECTED] Appeal already filed")
        if case.status != "judged":
            raise gl.vm.UserError("[EXPECTED] Appeal requires a first verdict")
        if case.verdict.outcome != "Contested":
            raise gl.vm.UserError("[EXPECTED] Appeal is only open after Contested")
        if not self._appeal_window_open(case):
            raise gl.vm.UserError("[EXPECTED] Appeal window is closed")
        paid = gl.message.value
        required = case.bond_atto * APPEAL_BOND_MULT
        if paid < required:
            raise gl.vm.UserError(
                "[EXPECTED] Appeal bond must be at least 2x the submit bond"
            )
        if paid < bond_atto:
            raise gl.vm.UserError(
                "[EXPECTED] msg.value is below the declared appeal bond_atto"
            )
        case.appeal.filed = True
        case.appeal.filer = gl.message.sender_address
        case.appeal.reason = reason
        case.appeal.bond_atto = paid
        case.status = "appealed"

    def _judgment_packet(self, case_id: str, round_name: str) -> dict:
        self._require_case(case_id)
        case = self.cases[case_id]
        self._require_policy(case.policy_id)
        policy = self.policies[case.policy_id]
        links = _parse_evidence_links(case.evidence_blob)
        control = _control_dict(case)
        return {
            "case_id": case.id,
            "round": round_name,
            "wallet": case.wallet,
            "policy_title": policy.title,
            "policy_body": policy.body,
            "links": links,
            "prior_outcome": case.verdict.outcome,
            "prior_verdict": case.verdict.text,
            "appeal_reason": case.appeal.reason,
            "control_present": control["present"],
            "control_message": control["message"],
            "control_signature": control["signature"],
            "control_signer": control["signer"],
            "control_signer_matches_target": control["signer_matches_target"],
            "control_message_names_wallet": control["message_names_wallet"],
            "control_message_names_policy": control["message_names_policy"],
        }

    @gl.public.write
    def judge_case(self, case_id: str) -> None:
        self._require_case(case_id)
        case = self.cases[case_id]
        if case.verdict.issued:
            raise gl.vm.UserError("[EXPECTED] Case already judged")
        if case.status != "submitted":
            raise gl.vm.UserError("[EXPECTED] Case is not awaiting first judgment")
        packet = self._judgment_packet(case_id, "first")
        written = _write_full_verdict(packet)
        decided = _decide_outcome(packet, written)
        _store_verdict(self.cases[case_id].verdict, written, decided)
        self.cases[case_id].status = "judged"
        self._settle_first(case_id)

    @gl.public.write
    def judge_appeal(self, case_id: str) -> None:
        self._require_case(case_id)
        case = self.cases[case_id]
        if not case.appeal.filed:
            raise gl.vm.UserError("[EXPECTED] No appeal to judge")
        if case.appeal.verdict.issued:
            raise gl.vm.UserError("[EXPECTED] Appeal already judged")
        if case.status != "appealed":
            raise gl.vm.UserError("[EXPECTED] Case is not awaiting appeal judgment")
        packet = self._judgment_packet(case_id, "appeal")
        written = _write_full_verdict(packet)
        decided = _decide_outcome(packet, written)
        _store_verdict(self.cases[case_id].appeal.verdict, written, decided)
        self.cases[case_id].status = "appeal_judged"
        self._settle_appeal(case_id)

    @gl.public.write
    def finalize_expired_appeal(self, case_id: str) -> None:
        self._require_case(case_id)
        case = self.cases[case_id]
        if case.status != "judged" or case.verdict.outcome != "Contested":
            raise gl.vm.UserError("[EXPECTED] No expired Contested appeal to finalize")
        if case.appeal.filed:
            raise gl.vm.UserError("[EXPECTED] Appeal already filed")
        if self._appeal_window_open(case):
            raise gl.vm.UserError("[EXPECTED] Appeal window is still open")
        if case.bond_status != "locked":
            raise gl.vm.UserError("[EXPECTED] Submit bond is not locked")
        self._return_bond(case.submitter, case.bond_atto)
        case.bond_status = "returned"
        case.status = "expired_unappealed"

    @gl.public.write
    def withdraw(self) -> None:
        key = str(gl.message.sender_address)
        amount = self._credit_of(key)
        if amount == u256(0):
            raise gl.vm.UserError("[EXPECTED] No withdrawable credit")
        self.credits[key] = u256(0)
        _NativeRecipient(gl.message.sender_address).emit_transfer(value=amount)

    @gl.public.view
    def get_policy(self, policy_id: str) -> dict:
        if policy_id not in self.policies:
            return {"found": False, "id": policy_id}
        policy = self.policies[policy_id]
        return {
            "found": True,
            "id": policy.id,
            "publisher": str(policy.publisher),
            "title": policy.title,
            "body": policy.body,
            "project": policy.project,
            "source": policy.source,
        }

    @gl.public.view
    def get_case(self, case_id: str) -> dict:
        if case_id not in self.cases:
            return {"found": False, "id": case_id}
        case = self.cases[case_id]
        links = _parse_evidence_links(case.evidence_blob)
        return {
            "found": True,
            "id": case.id,
            "submitter": str(case.submitter),
            "wallet": case.wallet,
            "policy_id": case.policy_id,
            "bond_atto": str(case.bond_atto),
            "bond_status": case.bond_status,
            "appeal_opens_at": case.appeal_opens_at,
            "appeal_deadline": case.appeal_deadline,
            "status": case.status,
            "evidence_blob": case.evidence_blob,
            "evidence_links": links,
            "control_statement": _control_dict(case),
            "verdict": _verdict_dict(case.verdict),
            "appeal": _appeal_dict(case.appeal),
        }

    @gl.public.view
    def is_eligible(self, wallet: str) -> dict:
        key = _wallet_key(wallet)
        if key in self.eligible_wallets:
            return {
                "eligible": True,
                "wallet": wallet,
                "case_id": self.eligible_wallets[key],
            }
        return {"eligible": False, "wallet": wallet, "case_id": ""}

    @gl.public.view
    def get_bond_status(self, case_id: str) -> dict:
        if case_id not in self.cases:
            return {"found": False, "id": case_id}
        case = self.cases[case_id]
        return {
            "found": True,
            "id": case.id,
            "status": case.status,
            "outcome": case.verdict.outcome,
            "appeal_outcome": case.appeal.verdict.outcome,
            "submitter": str(case.submitter),
            "submit_bond_atto": str(case.bond_atto),
            "appeal_bond_atto": str(case.appeal.bond_atto),
            "bond_status": case.bond_status,
            "appeal_filed": bool(case.appeal.filed),
            "appeal_window_open": self._appeal_window_open(case),
            "appeal_opens_at": case.appeal_opens_at,
            "appeal_deadline": case.appeal_deadline,
        }

    @gl.public.view
    def get_treasury(self) -> dict:
        return {"treasury_atto": str(self.treasury_atto)}

    @gl.public.view
    def get_credit(self, account: str) -> dict:
        return {"account": account, "credit_atto": str(self._credit_of(account))}

    @gl.public.view
    def get_economics(self) -> dict:
        return {
            "min_submit_bond_atto": str(MIN_SUBMIT_BOND),
            "appeal_bond_multiplier": str(APPEAL_BOND_MULT),
            "appeal_window_seconds": str(APPEAL_WINDOW_SECONDS),
            "treasury_atto": str(self.treasury_atto),
            "eligible_count": str(self.eligible_count),
        }

    @gl.public.view
    def get_verdict(self, case_id: str) -> dict:
        if case_id not in self.cases:
            return {"found": False, "id": case_id}
        case = self.cases[case_id]
        return {
            "found": True,
            "id": case.id,
            "status": case.status,
            "verdict": _verdict_dict(case.verdict),
            "appeal_verdict": _verdict_dict(case.appeal.verdict),
        }

    @gl.public.view
    def list_policy_ids(self) -> dict:
        return {
            "count": str(self.policy_count),
            "last_policy_id": self.last_policy_id,
            "ids": [item for item in self.policy_ids],
        }

    @gl.public.view
    def list_case_ids(self) -> dict:
        return {
            "count": str(self.case_count),
            "last_case_id": self.last_case_id,
            "ids": [item for item in self.case_ids],
        }
