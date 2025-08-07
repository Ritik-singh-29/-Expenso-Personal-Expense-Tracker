import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ description: "", amount: "", type: "expense" });
  const [darkMode, setDarkMode] = useState(false);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = () => {
    if (!form.description || !form.amount) return;
    setTransactions([...transactions, { ...form, id: Date.now(), date: new Date().toLocaleDateString() }]);
    setForm({ description: "", amount: "", type: "expense" });
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const categories = {
    rent: "#00FFFF",
    subscriptions: "#BF00FF",
    groceries: "#FFA500",
    travel: "#FF69B4"
  };

  const pieData = [];
  let categorizedExpenses = 0;
  transactions.forEach(t => {
    const isExpense = t.type === "expense";
    const key = t.type === "income" ? "Income" : Object.keys(categories).find(cat => t.description.toLowerCase().includes(cat)) || "Other";
    const existing = pieData.find(item => item.name === key);
    if (existing) {
      existing.value += parseFloat(t.amount);
    } else {
      pieData.push({ name: key, value: parseFloat(t.amount) });
    }
    if (isExpense) categorizedExpenses += parseFloat(t.amount);
  });

  pieData.push({ name: "Total Expenses", value: categorizedExpenses });
  pieData.push({ name: "Balance", value: balance });

  const pieColors = [
    "#39FF14", "#00FFFF", "#BF00FF", "#FFA500", "#FF69B4", "#FF6347", "#FF4500", "#00FF00"
  ];

  const lineData = transactions.map(t => ({
    name: t.date,
    income: t.type === "income" ? parseFloat(t.amount) : 0,
    expense: t.type === "expense" ? parseFloat(t.amount) : 0
  }));

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Finance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 14, 30);
    doc.text(`Total Expense: ₹${totalExpense.toFixed(2)}`, 14, 36);
    doc.text(`Balance: ₹${balance.toFixed(2)}`, 14, 42);
    autoTable(doc, {
      startY: 50,
      head: [["Description", "Amount (₹)", "Type", "Date"]],
      body: transactions.map(t => [t.description, parseFloat(t.amount).toFixed(2), t.type, t.date])
    });
    doc.save("finance_report.pdf");
  };

  return (
    <div className={`p-6 max-w-5xl mx-auto space-y-6 rounded-xl shadow-xl ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-center">
        <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-green-700'}`}>Expenso</h1>
        <div className="space-x-2">
          <Button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">📄 Download PDF</Button>
          <Button onClick={() => setDarkMode(!darkMode)} className="text-sm bg-green-600 hover:bg-green-700 text-white">{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., Grocery" />
            </div>
            <div>
              <Label>Amount</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="e.g., 500" />
            </div>
            <div>
              <Label>Type</Label>
              <Tabs value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <TabsList>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold">Add Transaction</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <Card><CardContent className="p-4"><h2>Total Income</h2><p className="text-green-700 font-bold text-xl">₹{totalIncome.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2>Total Expense</h2><p className="text-red-700 font-bold text-xl">₹{totalExpense.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><h2>Balance</h2><p className="text-blue-700 font-bold text-xl">₹{balance.toFixed(2)}</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Transactions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.description}</TableCell>
                <TableCell className={t.type === "income" ? "text-green-600" : "text-red-600"}>₹{parseFloat(t.amount).toFixed(2)}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{t.date}</TableCell>
                <TableCell><Button variant="outline" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Holographic Finance Dashboard</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie dataKey="value" data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`₹${value.toFixed(2)}`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent></Card>

      <Card><CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4 text-center">Income vs Expense Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Line type="monotone" dataKey="income" stroke="#39FF14" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expense" stroke="#FF69B4" strokeWidth={2} name="Expense" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent></Card>
    </div>
  );
}
