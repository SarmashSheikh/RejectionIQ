# RejectionIQ - Baseline / Load Testing Report

**Execution Timestamp**: `2026-08-07T13:54:55.551486`  
**Target Environment**: `http://127.0.0.1:8000`  

---

## 📊 Executive Summary

| Parameter | Value |
|---|---|
| **Virtual Users (VUs)** | `100` concurrent users |
| **Test Duration** | `60.27` seconds |
| **Total Requests Sent** | **22,898** |
| **Requests Per Second (RPS)** | **379.95 req/sec** |
| **Success Rate** | **39.99%** (9157 succeeded, 13741 failed) |

---

## ⏱️ Response Time Statistics

> [!NOTE]
> All response time metrics are measured end-to-end in milliseconds (ms).

| Metric | Latency (ms) | Target Benchmark | Description |
|---|---|---|---|
| **Fastest (Min)** | **9.29 ms** | `~50 ms` | Absolute fastest response time recorded |
| **Average (Avg)** | **260.85 ms** | `~250 ms` | Mean response latency across all virtual users |
| **Median (p50)** | **256.09 ms** | `~200 ms` | 50% of requests completed faster than this |
| **90th Percentile (p90)** | **302.46 ms** | `~400 ms` | 90% of requests completed within this window |
| **95th Percentile (p95)** | **319.03 ms** | `~450 ms` | 95% of requests completed within this window |
| **Slowest (Max)** | **510.2 ms** | `~1500 ms` | Maximum response time observed under heavy load |

---

## 🎯 Endpoint Throughput & Latency Breakdown

| Endpoint Name | Requests | RPS | Min (ms) | Avg (ms) | Max (ms) |
|---|---|---|---|---|---|
| **Root Welcome** | 4,578 | 75.96 req/s | 12.8 ms | 260.04 ms | 501.67 ms |
| **Health Check** | 4,579 | 75.98 req/s | 19.4 ms | 260.02 ms | 501.7 ms |
| **User Profile** | 4,581 | 76.01 req/s | 9.29 ms | 248.22 ms | 492.53 ms |
| **Rejections List** | 4,580 | 76.0 req/s | 29.69 ms | 268.06 ms | 510.01 ms |
| **Pattern Analysis** | 4,580 | 76.0 req/s | 31.2 ms | 267.92 ms | 510.2 ms |

---

## 🚦 HTTP Status Code Distribution

```json
{
  "200": 9157,
  "404": 4581,
  "401": 9160
}
```
