
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    RefreshCw,
    CalendarDays,
    Wallet,
    Eye,
    MousePointerClick,
    TrendingUp,
    BarChart3,
} from "lucide-react";

type MetaAdInsight = {
    id: number;
    date_start: string;
    date_stop: string;
    campaign_id: string | null;
    campaign_name: string | null;
    ad_set_id: string | null;
    ad_set_name: string | null;
    ad_id: string | null;
    ad_name: string | null;
    account_currency: string | null;
    spend: number | string | null;
    impressions: number | null;
    reach: number | null;
    clicks: number | null;
    cpc: number | null;
    cpm: number | null;
    ctr: number | null;
};

const ACCOUNT_ID = "1383568826134002";

function getDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatNumber(value: number) {
    return value.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
    });
}

function formatMoney(value: number, currency: string) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
    }).format(value);
}

export default function MetaAdsPerformancePage() {
    const today = getDateString(new Date());

    const [dateFrom, setDateFrom] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 29);
        return getDateString(date);
    });

    const [dateTo, setDateTo] = useState(today);
    const [insights, setInsights] = useState<MetaAdInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadInsights = useCallback(async () => {
        if (dateFrom && dateTo && dateFrom > dateTo) {
            setError("From Date cannot be greater than To Date.");
            setInsights([]);
            return;
        }

        setLoading(true);
        setError("");

        let query = supabase
            .from("meta_ad_insights")
            .select("*")
            .eq("account_id", ACCOUNT_ID);

        if (dateFrom) {
            query = query.gte("date_start", dateFrom);
        }

        if (dateTo) {
            query = query.lte("date_start", dateTo);
        }

        const { data, error: queryError } = await query
            .order("date_start", { ascending: false })
            .order("spend", { ascending: false });

        if (queryError) {
            setError(queryError.message);
            setInsights([]);
        } else {
            setInsights((data || []) as MetaAdInsight[]);
        }

        setLoading(false);
    }, [dateFrom, dateTo]);

    useEffect(() => {
        loadInsights();
    }, [loadInsights]);

    const totals = useMemo(() => {
        return insights.reduce(
            (acc, item) => ({
                spend: acc.spend + Number(item.spend || 0),
                impressions: acc.impressions + Number(item.impressions || 0),
                reach: acc.reach + Number(item.reach || 0),
                clicks: acc.clicks + Number(item.clicks || 0),
            }),
            {
                spend: 0,
                impressions: 0,
                reach: 0,
                clicks: 0,
            }
        );
    }, [insights]);

    const currency =
        insights.find((item) => item.account_currency)?.account_currency ||
        "INR";

    const cpc = totals.clicks
        ? totals.spend / totals.clicks
        : 0;

    const cpm = totals.impressions
        ? (totals.spend / totals.impressions) * 1000
        : 0;

    const ctr = totals.impressions
        ? (totals.clicks / totals.impressions) * 100
        : 0;

    const campaignSummary = useMemo(() => {
        const map = new Map<
            string,
            {
                name: string;
                spend: number;
                impressions: number;
                clicks: number;
            }
        >();

        insights.forEach((item) => {
            const name = item.campaign_name || "Unknown Campaign";

            const existing = map.get(name) || {
                name,
                spend: 0,
                impressions: 0,
                clicks: 0,
            };

            existing.spend += Number(item.spend || 0);
            existing.impressions += Number(item.impressions || 0);
            existing.clicks += Number(item.clicks || 0);

            map.set(name, existing);
        });

        return Array.from(map.values()).sort(
            (a, b) => b.spend - a.spend
        );
    }, [insights]);

    const cards = [
        {
            title: "Actual Ad Spend",
            value: formatMoney(totals.spend, currency),
            icon: Wallet,
        },
        {
            title: "Impressions",
            value: formatNumber(totals.impressions),
            icon: Eye,
        },
        {
            title: "Reach (Daily Sum)",
            value: formatNumber(totals.reach),
            icon: TrendingUp,
        },
        {
            title: "Clicks",
            value: formatNumber(totals.clicks),
            icon: MousePointerClick,
        },
        {
            title: "Average CPC",
            value: formatMoney(cpc, currency),
            icon: Wallet,
        },
        {
            title: "CPM",
            value: formatMoney(cpm, currency),
            icon: BarChart3,
        },
        {
            title: "CTR",
            value: `${ctr.toFixed(2)}%`,
            icon: TrendingUp,
        },
        {
            title: "Total Ad Records",
            value: formatNumber(insights.length),
            icon: BarChart3,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-[1600px]">

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Meta Ads Performance
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Actual advertising spend and campaign performance
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadInsights}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                        Refresh
                    </button>
                </div>

                {/* Date Filters */}
                <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                        <CalendarDays size={18} className="text-blue-600" />
                        <h2 className="font-semibold text-gray-800">
                            Date Range
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                max={dateTo || undefined}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-500">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || undefined}
                                max={today}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setDate(start.getDate() - 29);

                                    setDateFrom(getDateString(start));
                                    setDateTo(getDateString(end));
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Last 30 Days
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Performance Cards */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-medium text-gray-500">
                                        {card.title}
                                    </p>
                                    <Icon
                                        size={18}
                                        className="shrink-0 text-blue-600"
                                    />
                                </div>

                                <p className="mt-3 break-words text-xl font-bold text-gray-900">
                                    {card.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Campaign Summary */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Campaign Performance
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                Campaign-wise spend and results
                            </p>
                        </div>

                        <span className="text-xs text-gray-500">
                            {campaignSummary.length} Campaigns
                        </span>
                    </div>

                    {loading && insights.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-500">
                            Loading Meta Ads data...
                        </div>
                    ) : campaignSummary.length === 0 ? (
                        <div className="p-10 text-center text-sm text-gray-500">
                            No Meta Ads data found for this date range.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-left text-sm">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-4 py-3">Campaign</th>
                                        <th className="px-4 py-3 text-right">Spend</th>
                                        <th className="px-4 py-3 text-right">Impressions</th>
                                        <th className="px-4 py-3 text-right">Clicks</th>
                                        <th className="px-4 py-3 text-right">CPC</th>
                                        <th className="px-4 py-3 text-right">CTR</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {campaignSummary.map((item) => {
                                        const campaignCpc = item.clicks
                                            ? item.spend / item.clicks
                                            : 0;

                                        const campaignCtr = item.impressions
                                            ? (item.clicks / item.impressions) * 100
                                            : 0;

                                        return (
                                            <tr key={item.name} className="hover:bg-gray-50">
                                                <td className="max-w-[300px] px-4 py-3 font-medium text-gray-800">
                                                    {item.name}
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">
                                                    {formatMoney(item.spend, currency)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatNumber(item.impressions)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatNumber(item.clicks)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {formatMoney(campaignCpc, currency)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {campaignCtr.toFixed(2)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <p className="mt-4 text-xs text-gray-500">
                    Data source: Meta Ads Insights. Reach is the sum of daily
                    reach values and is not unique reach across the selected period.
                </p>
            </div>
        </div>
    );
}
