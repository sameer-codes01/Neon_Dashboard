"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { userActivityData } from "@/data/dashboard-data";

export function ActivityChart() {
    return (
        <Card className="p-6 h-[400px]">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">User Activity</h3>
                <p className="text-sm font-medium text-slate-500">
                    Weekly active vs new users
                </p>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <BarChart
                    data={userActivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        cursor={{ fill: "#f1f5f9" }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingBottom: "20px" }}
                    />
                    <Bar
                        dataKey="active"
                        name="Active Users"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    <Bar
                        dataKey="new"
                        name="New Signups"
                        fill="#a5b4fc"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
