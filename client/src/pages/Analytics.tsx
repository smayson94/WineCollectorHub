import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics");
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          Collection Analytics
        </h1>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <Card className="md:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle>Vintage Distribution</CardTitle>
                <CardDescription>Wine count by vintage year</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.vintageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vintage" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Wines by region</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.regionDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="region" type="category" width={100} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Variety Distribution</CardTitle>
                <CardDescription>Wines by grape variety</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.varietyDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="variety" type="category" width={100} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wine Maturity Analysis</CardTitle>
              <CardDescription>Current drinking window status of your collection</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.ageAnalysis} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" width={120} />
                  <Tooltip />
                  <Bar 
                    dataKey="count" 
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Storage Bin Utilization</CardTitle>
              <CardDescription>Current storage capacity and utilization by bin</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.binDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="binName" type="category" width={120} />
                  <Tooltip 
                    content={({ payload }) => {
                      if (!payload?.[0]) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border p-2 rounded-lg shadow-lg">
                          <p className="font-medium">{data.binName}</p>
                          <p>Utilization: {data.utilizationRate}%</p>
                          <p>Wines: {data.count}/{data.capacity}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar 
                    dataKey="utilizationRate" 
                    fill="var(--primary)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Average Ratings by Vintage</CardTitle>
                <CardDescription>Wine ratings distribution across vintages</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics?.ratingsByVintage}
                    aria-label="Average ratings by vintage chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vintage" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip
                      content={({ payload, label }) => {
                        if (!payload?.[0]) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">Vintage {label}</p>
                            <p>Average Rating: {data.avgRating}</p>
                            <p>Number of Ratings: {data.count}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgRating"
                      stroke="var(--primary)"
                      name="Average Rating"
                      strokeWidth={2}
                      dot={{ fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vintage Performance</CardTitle>
                <CardDescription>Detailed analysis of wines by vintage year</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.vintagePerformance}
                    aria-label="Vintage performance chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vintage" />
                    <YAxis yAxisId="left" orientation="left" stroke="var(--primary)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" />
                    <Tooltip
                      content={({ payload, label }) => {
                        if (!payload?.[0]) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">Vintage {label}</p>
                            <p>Total Wines: {data.totalWines}</p>
                            <p>Average Rating: {data.avgRating}</p>
                            <p>Number of Ratings: {data.ratingCount}</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="totalWines"
                      fill="var(--primary)"
                      name="Total Wines"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgRating"
                      stroke="var(--muted-foreground)"
                      name="Average Rating"
                      strokeWidth={2}
                      dot={{ fill: "var(--muted-foreground)" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Bin Utilization</CardTitle>
                <CardDescription>Current storage capacity and utilization by bin</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.binDistribution}
                    layout="vertical"
                    aria-label="Storage bin utilization chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="binName" type="category" width={120} />
                    <Tooltip 
                      content={({ payload }) => {
                        if (!payload?.[0]) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">{data.binName}</p>
                            <p>Utilization: {data.utilizationRate}%</p>
                            <p>Wines: {data.count}/{data.capacity}</p>
                          </div>
                        );
                      }}
                    />
                    <Bar 
                      dataKey="utilizationRate" 
                      fill="var(--primary)"
                      radius={[0, 4, 4, 0]}
                      name="Utilization Rate"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Trends</CardTitle>
                <CardDescription>Historical storage utilization patterns</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics?.storageAnalytics}
                    aria-label="Storage trends chart"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="binName"
                      padding={{ left: 20, right: 20 }}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ payload, label }) => {
                        if (!payload?.[0]) return null;
                        const data = payload[0].payload;
                        const utilizationRate = (data.used / data.capacity) * 100;
                        return (
                          <div className="bg-background border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p>Current Usage: {data.used} wines</p>
                            <p>Capacity: {data.capacity}</p>
                            <p>Utilization: {utilizationRate.toFixed(1)}%</p>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="used"
                      stroke="var(--primary)"
                      name="Wines Stored"
                      strokeWidth={2}
                      dot={{ fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
