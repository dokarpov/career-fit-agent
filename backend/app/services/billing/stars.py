from __future__ import annotations
import json

SKU="managed_search_cycle"

def invoice_payload(chat_id:int, stars:int, payload:str="managed_search_cycle_v1"):
    return {
      "chat_id":chat_id,
      "title":"Career Fit — Managed Search Cycle",
      "description":"Managed search automation, hosted connectors, evidence rebuild and Telegram alerts for one search cycle.",
      "payload":payload,
      "currency":"XTR",
      "prices":[{"label":"Managed Search Cycle","amount":int(stars)}]
    }

def payment_record(successful_payment:dict):
    return {
      "sku":SKU,
      "currency":successful_payment.get("currency"),
      "total_amount":successful_payment.get("total_amount"),
      "invoice_payload":successful_payment.get("invoice_payload"),
      "telegram_payment_charge_id":successful_payment.get("telegram_payment_charge_id"),
      "provider_payment_charge_id":successful_payment.get("provider_payment_charge_id")
    }
