"use client"
import { CardDescription } from "@/components/ui/card"
import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"
import { useState, useEffect } from "react"
import Papa from "papaparse"
import { useToast } from "@/hooks/use-toast"
import {
  Package,
  Users,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Home,
  BarChart3,
  Settings,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  MapPin,
  Bell,
  LogOut,
  Tag,
  Shirt,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset, // Import SidebarInset
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Import new management components
import { ItemsInManagement } from "@/components/items-in-management"
import { ItemsOutManagement } from "@/components/items-out-management"
import { ReportsManagement } from "@/components/reports-management"
import { LocationManagement } from "@/components/location-management"
import { CategoryManagement } from "@/components/category-management"
import { LoogBookManagement } from "@/components/loog-book-management"
import { CostControlManagement } from "@/components/cost-control-management"
import { InvoiceManagement } from "@/components/invoice-management"
import { GuestLaundryManagement } from "@/components/guest-laundry-management"

// Import Server Actions
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  returnBorrowing,
  fetchDepreciations,
  createDepreciation,
  updateDepreciation,
  deleteDepreciation,
  fetchCategories,
} from "@/app/actions"

// Types (exported for use in mock-db.ts and actions.ts)
export interface User {
  id: number
  username: string
  name: string
  email: string
  role: "admin" | "manager" | "staff"
  status: "active" | "inactive"
  lastLogin: string
  avatarUrl?: string
}

export interface Item {
  id: number
  code: string
  name: string
  category: string
  description: string
  unit: string
  minStock: number
  currentStock: number
  location: string
  supplierId: number
  price: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

export interface Supplier {
  id: number
  code: string
  name: string
  contact: string
  phone: string
  email: string
  address: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Transaction {
  id: number
  type: "in" | "out" | "borrow" | "return"
  itemId: number
  quantity: number
  userId: number
  supplierId?: number
  borrowerId?: string
  notes: string
  status: "pending" | "approved" | "completed" | "cancelled"
  date: string
  dueDate?: string
  returnDate?: string
}

export interface Depreciation {
  id: number
  itemId: number
  quantity: number
  date: string
  reason: string
  userId: number
  status: "completed" | "pending"
}

export interface Category {
  id: number
  code: string
  name: string
  description: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

// Define a type for a log entry (moved from LoogBookManagement)
export interface LogEntry {
  id: number
  date: string
  itemId: number
  outQuantity: number
  inQuantity: number
  pendingQuantity: number
  returnedQuantity: number
  returnedImageUrl?: string
  returnedDate?: string
}

// Helper function to download CSV
const downloadCsv = (data: any[], filename: string, headers: string[], toast: ReturnType<typeof useToast>["toast"]) => {
  try {
    const csv = Papa.unparse(data, {
      header: true,
      columns: headers,
    })
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Export Berhasil",
        description: `Data berhasil diekspor ke ${filename}`,
      })
    }
  } catch (error: any) {
    toast({
      title: "Export Gagal",
      description: `Terjadi kesalahan saat mengekspor: ${error.message}`,
      variant: "destructive",
    })
  }
}

// Navigation items with permissions
const getNavigationItems = (userRole: string) => {
  const allItems = [
    { title: "DASHBOARD", icon: Home, key: "dashboard", roles: ["admin", "manager", "staff"] },
    {
      title: "LAUNDRY",
      icon: Shirt, // Using Shirt icon for Laundry
      key: "laundry",
      roles: ["admin", "manager", "staff"], // Assuming admin, manager, and staff can access laundry
      children: [
        {
          title: "CM Coin Laundry",
          key: "cm-coin-laundry",
          roles: ["admin", "manager"],
          children: [
            { title: "Loog Book", key: "loog-book", roles: ["admin", "manager"] },
            { title: "Cost Control", key: "cost-control", roles: ["admin", "manager"] },
            { title: "Invoice", key: "invoice", roles: ["admin", "manager"] },
            { title: "Guest Laundry", key: "guest-laundry", roles: ["admin", "manager", "staff"] },
          ],
        },
      ],
    },
    { title: "DATA BARANG", icon: Package, key: "items", roles: ["admin", "manager", "staff"] },
    { title: "KATEGORI BARANG", icon: Tag, key: "categories", roles: ["admin", "manager"] },
    { title: "DATA SUPPLIER", icon: Truck, key: "suppliers", roles: ["admin", "manager"] },
    { title: "PEMINJAMAN", icon: ArrowUpRight, key: "borrowing", roles: ["admin", "manager", "staff"] },
    { title: "PENYUSUTAN BARANG", icon: ArrowDownLeft, key: "depreciation", roles: ["admin", "manager", "staff"] },
    { title: "BARANG MASUK", icon: ArrowDownLeft, key: "items-in", roles: ["admin", "manager"] },
    { title: "BARANG KELUAR", icon: ArrowUpRight, key: "items-out", roles: ["admin", "manager"] },
    { title: "LOKASI PENYIMPANAN", icon: MapPin, key: "locations", roles: ["admin", "manager", "staff"] },
    { title: "DATA PENGGUNA", icon: Users, key: "users", roles: ["admin"] },
    { title: "LAPORAN", icon: BarChart3, key: "reports", roles: ["admin", "manager"] },
    { title: "PENGATURAN", icon: Settings, key: "settings", roles: ["admin", "manager", "staff"] },
  ]

  // Filter items based on user role and recursively filter children
  const filterItemsByRole = (items: (typeof allItems)[0][], role: string) => {
    return items.reduce((acc: (typeof allItems)[0][], item) => {
      if (item.roles.includes(role)) {
        const newItem = { ...item }
        if (item.children) {
          newItem.children = filterItemsByRole(item.children, role)
        }
        acc.push(newItem)
      }
      return acc
    }, [])
  }

  return filterItemsByRole(allItems, userRole)
}

// Login Component
function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { toast } = useToast()

  // Mock users for preview environment when Supabase is not fully configured
  const mockUsers: User[] = [
    {
      id: 1,
      username: "Bas",
      name: "Bas",
      email: "bas@example.com",
      role: "admin",
      status: "active",
      lastLogin: "2023-01-01",
    },
    {
      id: 2,
      username: "Kiswanto",
      name: "Kiswanto",
      email: "kiswanto@example.com",
      role: "manager",
      status: "active",
      lastLogin: "2023-01-01",
    },
    {
      id: 3,
      username: "hkcrew",
      name: "HK Crew",
      email: "hkcrew@example.com",
      role: "staff",
      status: "active",
      lastLogin: "2023-01-01",
    },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let availableUsers = await fetchUsers() // Try to fetch from Supabase

      // If Supabase returns no users (e.g., in preview or not seeded), use mock users
      if (availableUsers.length === 0) {
        availableUsers = mockUsers
      }

      const user = availableUsers.find((u) => u.username === username)

      if (user) {
        // Mock password check for demo purposes. In a real app, use secure authentication.
        if (
          (user.username === "Bas" && password === "Husky321") ||
          (user.username === "Kiswanto" && password === "Kiswanto1973") ||
          (user.username === "hkcrew" && password === "Crew321")
        ) {
          onLogin(user)
        } else {
          setError("Username atau password salah")
          toast({
            title: "Login Gagal",
            description: "Username atau password salah.",
            variant: "destructive",
          })
        }
      } else {
        setError("Username atau password salah")
        toast({
          title: "Login Gagal",
          description: "Username atau password salah.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setError("Terjadi kesalahan saat login")
      toast({
        title: "Login Gagal",
        description: `Terjadi kesalahan: ${err.message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#25282A] to-[#25282A] p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="w-80 h-20 bg-white rounded-lg flex items-center justify-center mx-auto overflow-hidden p-4 shadow-sm">
            <img
              src="/images/ramayana-logo-new.png"
              alt="Ramayana Hotel Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl sm:text-2xl font-bold">Inventaris HK</CardTitle>
            <p className="text-sm sm:text-base text-gray-600">Hotel Management System</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Component
function Dashboard({
  user,
  items,
  users,
  suppliers,
  transactions,
  setCurrentPage,
}: {
  user: User
  items: Item[]
  users: User[]
  suppliers: Supplier[]
  transactions: Transaction[]
  setCurrentPage: (page: string) => void
}) {
  const dashboardStats = [
    {
      title: "Model Barang",
      value: items.length.toString(),
      color: "bg-gradient-to-br from-green-500 to-green-600",
      icon: Package,
      link: "items",
    },
    {
      title: "Pengguna",
      value: users.length.toString(),
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      icon: Users,
      link: "users",
    },
    {
      title: "Supplier",
      value: suppliers.length.toString(),
      color: "bg-gradient-to-br from-red-500 to-red-600",
      icon: Truck,
      link: "suppliers",
    },
    {
      title: "Transaksi Peminjaman",
      value: transactions.filter((t) => t.type === "borrow").length.toString(),
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      icon: ArrowUpRight,
      link: "borrowing",
    },
  ]

  const transactionStats = [
    {
      title: "Total Barang Masuk",
      value: transactions
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.quantity, 0)
        .toString(),
      color: "bg-gradient-to-br from-blue-600 to-blue-700",
      link: "items-in",
    },
    {
      title: "Total Barang Keluar",
      value: transactions
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.quantity, 0)
        .toString(),
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      link: "items-out",
    },
    {
      title: "Total Transaksi Barang Masuk",
      value: transactions.filter((t) => t.type === "in").length.toString(),
      color: "bg-gradient-to-br from-orange-600 to-orange-700",
      link: "items-in",
    },
    {
      title: "Total Transaksi Barang Keluar",
      value: transactions.filter((t) => t.type === "out").length.toString(),
      color: "bg-gradient-to-br from-blue-700 to-blue-800",
      link: "items-out",
    },
  ]

  const loanStats = [
    {
      title: "Peminjaman Dikembalikan",
      value: transactions.filter((t) => t.type === "return").length.toString(),
      color: "bg-gradient-to-br from-green-600 to-green-700",
      link: "borrowing",
    },
    {
      title: "Peminjaman Belum Dikembalikan",
      value: transactions.filter((t) => t.type === "borrow" && t.status !== "completed").length.toString(),
      color: "bg-gradient-to-br from-red-600 to-red-700",
      link: "borrowing",
    },
  ]

  const lowStockItems = items.filter((item) => item.currentStock <= item.minStock).slice(0, 5)
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Message */}
      <div className="bg-[#F0D58D] text-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Selamat Datang, {user.name}!</h2>
        <p className="text-sm sm:text-base opacity-90">
          Role: {user.role.toUpperCase()} | Last Login: {user.lastLogin}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {dashboardStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => setCurrentPage(stat.link)}
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-4 sm:p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
                <div className="relative z-10">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-3 sm:mb-4" />
                  <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {transactionStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => setCurrentPage(stat.link)}
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-4 sm:p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"></div>
                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {loanStats.map((stat, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => setCurrentPage(stat.link)}
          >
            <CardContent className="p-0">
              <div className={`${stat.color} p-4 sm:p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10"></div>
                <div className="relative z-10">
                  <div className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm opacity-90">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low Stock Items */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl font-bold">Barang Stok Rendah</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCurrentPage("items")} className="self-start sm:self-auto">
            Lihat Semua <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 space-y-2 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-red-800 truncate">{item.name}</p>
                      <p className="text-sm text-red-600">
                        Stok: {item.currentStock} {item.unit} (Min: {item.minStock})
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="self-start sm:self-auto">
                    Stok Rendah
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">Tidak ada barang dengan stok rendah.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl font-bold">Aktivitas Transaksi Terbaru</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage("borrowing")}
            className="self-start sm:self-auto"
          >
            Lihat Semua <ArrowUpRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const item = items.find((i) => i.id === transaction.itemId)
                const transactionTypeLabel =
                  transaction.type === "in"
                    ? "Barang Masuk"
                    : transaction.type === "out"
                      ? "Barang Keluar"
                      : transaction.type === "borrow"
                        ? "Peminjaman"
                        : "Pengembalian"
                const statusVariant =
                  transaction.status === "completed"
                    ? "default"
                    : transaction.status === "pending"
                      ? "secondary"
                      : "destructive"

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div
                        className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                          transaction.type === "in"
                            ? "bg-green-500"
                            : transaction.type === "out"
                              ? "bg-red-500"
                              : transaction.type === "borrow"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                        }`}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item?.name || "Barang Tidak Dikenal"}</p>
                        <p className="text-sm text-gray-600">
                          {transactionTypeLabel} - {transaction.quantity} {item?.unit || "unit"}
                        </p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant} className="self-start sm:self-auto">
                      {transaction.status === "completed"
                        ? "Selesai"
                        : transaction.status === "pending"
                          ? "Dipinjam"
                          : transaction.status}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-600 text-center py-4">Tidak ada aktivitas transaksi terbaru.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Items Management Component
function ItemsManagement({
  user,
  items,
  suppliers,
  refreshData,
  categories,
  setCurrentPage,
}: {
  user: User
  items: Item[]
  suppliers: Supplier[]
  refreshData: () => void
  categories: Category[]
  setCurrentPage: (page: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(
    selectedItem?.imageUrl ? new File([], selectedItem.imageUrl) : null,
  )
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(selectedItem?.imageUrl || null)
  const { toast } = useToast()

  const itemCategories = [
    "all",
    ...Array.from(new Set(categories.filter((cat) => cat.status === "active").map((category) => category.name))),
  ]

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      setPreviewImageUrl(URL.createObjectURL(file))
    } else {
      setSelectedImageFile(null)
      setPreviewImageUrl(null)
    }
  }

  const handleAddItem = async (formData: FormData) => {
    const result = await createItem(formData, previewImageUrl || undefined)
    if (result.success) {
      setIsAddDialogOpen(false)
      setSelectedImageFile(null)
      setPreviewImageUrl(null)
      toast({ title: "Barang Ditambahkan", description: result.message })
      // Refresh data immediately to show new item
      await refreshData()
    } else {
      toast({ title: "Gagal Menambah Barang", description: result.message, variant: "destructive" })
    }
  }

  const handleEditItem = (item: Item) => {
    setSelectedItem(item)
    setPreviewImageUrl(item.imageUrl || null)
    setIsEditDialogOpen(true)
  }

  const handleViewItem = (item: Item) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  const handleUpdateItem = async (formData: FormData) => {
    if (!selectedItem) return
    formData.append("id", selectedItem.id.toString())
    formData.append("createdAt", selectedItem.createdAt)
    const result = await updateItem(formData, previewImageUrl || undefined)
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedItem(null)
      setSelectedImageFile(null)
      setPreviewImageUrl(null)
      toast({ title: "Barang Diperbarui", description: result.message })
      // Refresh data immediately to show updated item
      await refreshData()
    } else {
      toast({ title: "Gagal Memperbarui Barang", description: result.message, variant: "destructive" })
    }
  }

  const handleDeleteItem = async (id: number) => {
    const result = await deleteItem(id)
    if (result.success) {
      toast({ title: "Barang Dihapus", description: result.message, variant: "destructive" })
      // Refresh data immediately to remove deleted item
      await refreshData()
    } else {
      toast({ title: "Gagal Menghapus Barang", description: result.message, variant: "destructive" })
    }
  }

  const getStockStatus = (item: Item) => {
    if (item.currentStock <= item.minStock) return "low"
    if (item.currentStock <= item.minStock * 1.5) return "medium"
    return "high"
  }

  const handleExportItems = () => {
    const headers = [
      "id",
      "code",
      "name",
      "category",
      "description",
      "unit",
      "minStock",
      "currentStock",
      "location",
      "supplierId",
      "price",
      "status",
      "createdAt",
      "updatedAt",
      "imageUrl",
    ]
    downloadCsv(items, "items_data.csv", headers, toast)
  }

  const handleImportItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        let successCount = 0
        let errorCount = 0

        for (const row of importedData) {
          const formData = new FormData()
          formData.append("code", row.Code)
          formData.append("name", row.Name)
          formData.append("category", row.Category)
          formData.append("description", row.Description || "")
          formData.append("unit", row.Unit)
          formData.append("minStock", row.MinStock)
          formData.append("currentStock", row.CurrentStock)
          formData.append("location", row.Location)
          formData.append("supplierId", row.SupplierID)
          formData.append("price", row.Price)
          // Status, createdAt, updatedAt, imageUrl are optional for import
          if (row.Status) formData.append("status", row.Status)
          if (row.CreatedAt) formData.append("createdAt", row.CreatedAt)
          if (row.UpdatedAt) formData.append("updatedAt", row.UpdatedAt)
          // For image URL, we'll just pass it as a string, not an actual file upload
          const imageUrl = row.ImageUrl || undefined

          const result = await createItem(formData, imageUrl)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast({
              title: "Import Sebagian Gagal",
              description: `Gagal mengimpor baris untuk item ${row.Name}: ${result.message}`,
              variant: "destructive",
            })
          }
        }

        if (successCount > 0) {
          await refreshData() // Refresh data after import
          toast({
            title: "Import Selesai",
            description: `${successCount} barang berhasil diimpor, ${errorCount} gagal.`,
          })
        } else if (errorCount > 0) {
          toast({
            title: "Import Gagal Total",
            description: `Tidak ada barang yang berhasil diimpor.`,
            variant: "destructive",
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  // Get category name by category ID or name
  const getCategoryDisplayName = (categoryValue: string) => {
    const category = categories.find((cat) => cat.name === categoryValue || cat.id.toString() === categoryValue)
    return category ? category.name : categoryValue
  }

  // Check if there are any active categories available
  const hasActiveCategories = categories.some((cat) => cat.status === "active")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Data Barang</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola inventaris barang hotel</p>
          {!hasActiveCategories && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-800">
                    Belum ada kategori aktif. Silakan buat kategori terlebih dahulu di menu{" "}
                    <button
                      onClick={() => setCurrentPage("categories")}
                      className="font-medium underline hover:text-yellow-900"
                    >
                      Kategori Barang
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExportItems} size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input type="file" accept=".csv" onChange={handleImportItems} className="hidden" id="import-items-csv" />
          <Button
            onClick={() => document.getElementById("import-items-csv")?.click()}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          {(user.role === "admin" || user.role === "manager") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto" disabled={!hasActiveCategories}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Barang
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Barang Baru</DialogTitle>
                  <DialogDescription>Masukkan informasi barang baru</DialogDescription>
                </DialogHeader>
                <form action={handleAddItem} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Kode Barang</Label>
                      <Input id="code" name="code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Barang</Label>
                      <Input id="name" name="name" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Select name="category" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat) => cat.status === "active")
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name} ({category.code})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Satuan</Label>
                      <Input id="unit" name="unit" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Stok Minimum</Label>
                      <Input id="minStock" name="minStock" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentStock">Stok Saat Ini</Label>
                      <Input id="currentStock" name="currentStock" type="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga</Label>
                      <Input id="price" name="price" type="number" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Lokasi</Label>
                      <Input id="location" name="location" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplierId">Supplier</Label>
                      <Select name="supplierId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers
                            .filter((supplier) => supplier.status === "active")
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemImage">Gambar Barang</Label>
                    <Input id="itemImage" type="file" accept="image/*" onChange={handleImageChange} />
                    {previewImageUrl && (
                      <img
                        src={previewImageUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="mt-2 h-20 w-20 object-cover rounded-md"
                      />
                    )}
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {itemCategories.slice(1).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead className="hidden md:table-cell">Status Stok</TableHead>
                  <TableHead className="hidden lg:table-cell">Lokasi</TableHead>
                  <TableHead className="hidden lg:table-cell">Harga</TableHead>
                  <TableHead className="hidden xl:table-cell">Tgl Input</TableHead>
                  <TableHead className="w-24">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || selectedCategory !== "all"
                          ? "Tidak ada barang yang sesuai dengan pencarian"
                          : "Belum ada data barang. Tambahkan barang pertama Anda!"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs text-center p-1">
                              No Image
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-32">{item.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{getCategoryDisplayName(item.category)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item.currentStock} {item.unit}
                            </p>
                            <p className="text-sm text-gray-500">Min: {item.minStock}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={
                              stockStatus === "low" ? "destructive" : stockStatus === "medium" ? "secondary" : "default"
                            }
                          >
                            {stockStatus === "low"
                              ? "Stok Rendah"
                              : stockStatus === "medium"
                                ? "Stok Sedang"
                                : "Stok Aman"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{item.location}</TableCell>
                        <TableCell className="hidden lg:table-cell">Rp {item.price.toLocaleString()}</TableCell>
                        <TableCell className="hidden xl:table-cell text-sm text-gray-500">{item.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewItem(item)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(user.role === "admin" || user.role === "manager") && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Item Dialog */}
      {selectedItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Barang</DialogTitle>
              <DialogDescription>Perbarui informasi barang</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCode">Kode Barang</Label>
                  <Input id="editCode" name="code" required defaultValue={selectedItem.code} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editName">Nama Barang</Label>
                  <Input id="editName" name="name" required defaultValue={selectedItem.name} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editCategory">Kategori</Label>
                  <Select name="category" required defaultValue={selectedItem.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat.status === "active")
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name} ({category.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editUnit">Satuan</Label>
                  <Input id="editUnit" name="unit" required defaultValue={selectedItem.unit} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDescription">Deskripsi</Label>
                <Textarea id="editDescription" name="description" defaultValue={selectedItem.description} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editMinStock">Stok Minimum</Label>
                  <Input
                    id="editMinStock"
                    name="minStock"
                    type="number"
                    required
                    defaultValue={selectedItem.minStock}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCurrentStock">Stok Saat Ini</Label>
                  <Input
                    id="editCurrentStock"
                    name="currentStock"
                    type="number"
                    required
                    defaultValue={selectedItem.currentStock}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPrice">Harga</Label>
                  <Input id="editPrice" name="price" type="number" required defaultValue={selectedItem.price} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editLocation">Lokasi</Label>
                  <Input id="editLocation" name="location" required defaultValue={selectedItem.location} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSupplierId">Supplier</Label>
                  <Select name="supplierId" required defaultValue={selectedItem.supplierId.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers
                        .filter((supplier) => supplier.status === "active")
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select name="status" required defaultValue={selectedItem.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editItemImage">Gambar Barang</Label>
                <Input id="editItemImage" type="file" accept="image/*" onChange={handleImageChange} />
                {previewImageUrl && (
                  <img
                    src={previewImageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="mt-2 h-20 w-20 object-cover rounded-md"
                  />
                )}
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Item Dialog */}
      {selectedItem && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Barang</DialogTitle>
              <DialogDescription>Informasi lengkap tentang barang ini</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedItem.imageUrl && (
                <img
                  src={selectedItem.imageUrl || "/placeholder.svg"}
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <div className="space-y-3">
                <div>
                  <strong className="text-sm">Kode:</strong>
                  <p className="text-sm">{selectedItem.code}</p>
                </div>
                <div>
                  <strong className="text-sm">Nama:</strong>
                  <p className="text-sm">{selectedItem.name}</p>
                </div>
                <div>
                  <strong className="text-sm">Kategori:</strong>
                  <p className="text-sm">{getCategoryDisplayName(selectedItem.category)}</p>
                </div>
                <div>
                  <strong className="text-sm">Deskripsi:</strong>
                  <p className="text-sm">{selectedItem.description || "-"}</p>
                </div>
                <div>
                  <strong className="text-sm">Stok Saat Ini:</strong>
                  <p className="text-sm">
                    {selectedItem.currentStock} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <strong className="text-sm">Stok Minimum:</strong>
                  <p className="text-sm">
                    {selectedItem.minStock} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <strong className="text-sm">Lokasi:</strong>
                  <p className="text-sm">{selectedItem.location}</p>
                </div>
                <div>
                  <strong className="text-sm">Supplier:</strong>
                  <p className="text-sm">{suppliers.find((s) => s.id === selectedItem.supplierId)?.name || "N/A"}</p>
                </div>
                <div>
                  <strong className="text-sm">Harga:</strong>
                  <p className="text-sm">Rp {selectedItem.price.toLocaleString()}</p>
                </div>
                <div>
                  <strong className="text-sm">Status:</strong>
                  <Badge className="ml-2">{selectedItem.status}</Badge>
                </div>
                <div>
                  <strong className="text-sm">Tanggal Input:</strong>
                  <p className="text-sm">{selectedItem.createdAt}</p>
                </div>
                <div>
                  <strong className="text-sm">Terakhir Diperbarui:</strong>
                  <p className="text-sm">{selectedItem.updatedAt}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewDialogOpen(false)} className="w-full">
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Suppliers Management Component
function SuppliersManagement({
  user,
  suppliers,
  refreshData,
  transactions,
  items,
}: {
  user: User
  items: Item[]
  suppliers: Supplier[]
  refreshData: () => void
  transactions: Transaction[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const { toast } = useToast()

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSupplier = async (formData: FormData) => {
    const result = await createSupplier(formData)
    if (result.success) {
      setIsAddDialogOpen(false)
      toast({ title: "Supplier Ditambahkan", description: result.message })
      // Refresh data immediately to show new supplier
      await refreshData()
    } else {
      toast({ title: "Gagal Menambah Supplier", description: result.message, variant: "destructive" })
    }
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSupplier = async (formData: FormData) => {
    if (!selectedSupplier) return
    formData.append("id", selectedSupplier.id.toString())
    formData.append("createdAt", selectedSupplier.createdAt)
    const result = await updateSupplier(formData)
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedSupplier(null)
      toast({ title: "Supplier Diperbarui", description: result.message })
      // Refresh data immediately to show updated supplier
      await refreshData()
    } else {
      toast({ title: "Gagal Memperbarui Supplier", description: result.message, variant: "destructive" })
    }
  }

  const handleDeleteSupplier = async (id: number) => {
    const result = await deleteSupplier(id)
    if (result.success) {
      toast({ title: "Supplier Dihapus", description: result.message, variant: "destructive" })
      // Refresh data immediately to remove deleted supplier
      await refreshData()
    } else {
      toast({ title: "Gagal Menghapus Supplier", description: result.message, variant: "destructive" })
    }
  }

  // Get supplier statistics
  const getSupplierStats = (supplierId: number) => {
    const supplierItems = items.filter((item) => item.supplierId === supplierId)
    const supplierTransactions = transactions.filter((t) => t.supplierId === supplierId)
    return {
      itemCount: supplierItems.length,
      transactionCount: supplierTransactions.length,
      totalValue: supplierItems.reduce((sum, item) => sum + item.price * item.currentStock, 0),
    }
  }

  const handleExportSuppliers = () => {
    const headers = ["id", "code", "name", "contact", "phone", "email", "address", "status", "createdAt"]
    downloadCsv(suppliers, "suppliers_data.csv", toast)
  }

  const handleImportSuppliers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        let successCount = 0
        let errorCount = 0

        for (const row of importedData) {
          const formData = new FormData()
          formData.append("code", row.Code)
          formData.append("name", row.Name)
          formData.append("contact", row.Contact)
          formData.append("phone", row.Phone)
          formData.append("email", row.Email)
          formData.append("address", row.Address)
          if (row.Status) formData.append("status", row.Status)
          if (row.CreatedAt) formData.append("createdAt", row.CreatedAt)

          const result = await createSupplier(formData)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast({
              title: "Import Sebagian Gagal",
              description: `Gagal mengimpor baris untuk supplier ${row.Name}: ${result.message}`,
              variant: "destructive",
            })
          }
        }

        if (successCount > 0) {
          await refreshData() // Refresh data immediately after import
          toast({
            title: "Import Berhasil",
            description: `${successCount} supplier berhasil diimpor, ${errorCount} gagal.`,
          })
        } else if (errorCount > 0) {
          toast({
            title: "Import Gagal Total",
            description: `Tidak ada supplier yang berhasil diimpor.`,
            variant: "destructive",
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Data Supplier</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola data supplier hotel</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExportSuppliers} size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportSuppliers}
            className="hidden"
            id="import-suppliers-csv"
          />
          <Button
            onClick={() => document.getElementById("import-suppliers-csv")?.click()}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          {(user.role === "admin" || user.role === "manager") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Supplier
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Supplier Baru</DialogTitle>
                  <DialogDescription>Masukkan informasi supplier baru</DialogDescription>
                </DialogHeader>
                <form action={handleAddSupplier} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Kode Supplier</Label>
                      <Input id="code" name="code" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Supplier</Label>
                      <Input id="name" name="name" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact">Nama Kontak</Label>
                      <Input id="contact" name="contact" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telepon</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Textarea id="address" name="address" required />
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Batal
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto">
                      Simpan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Cari supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredSuppliers.map((supplier) => {
          const stats = getSupplierStats(supplier.id)
          return (
            <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg truncate">{supplier.name}</CardTitle>
                    <p className="text-sm text-gray-600">{supplier.code}</p>
                  </div>
                  <Badge variant={supplier.status === "active" ? "default" : "secondary"} className="self-start">
                    {supplier.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Kontak:</p>
                    <p className="text-sm text-gray-600 truncate">{supplier.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telepon:</p>
                    <p className="text-sm text-gray-600">{supplier.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email:</p>
                    <p className="text-sm text-gray-600 truncate">{supplier.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Alamat:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{supplier.address}</p>
                  </div>

                  {/* Supplier Statistics */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Barang:</span>
                      <span className="text-xs font-medium">{stats.itemCount} item</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Transaksi:</span>
                      <span className="text-xs font-medium">{stats.transactionCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total Nilai:</span>
                      <span className="text-xs font-medium">Rp {stats.totalValue.toLocaleString()}</span>
                    </div>
                  </div>

                  {(user.role === "admin" || user.role === "manager") && (
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="ghost" size="sm" onClick={() => handleEditSupplier(supplier)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteSupplier(supplier.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm
                ? "Tidak ada supplier yang sesuai dengan pencarian"
                : "Belum ada data supplier. Tambahkan supplier pertama Anda!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Supplier Dialog */}
      {selectedSupplier && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
              <DialogDescription>Perbarui informasi supplier</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateSupplier} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editSupplierCode">Kode Supplier</Label>
                  <Input id="editSupplierCode" name="code" required defaultValue={selectedSupplier.code} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editSupplierName">Nama Supplier</Label>
                  <Input id="editSupplierName" name="name" required defaultValue={selectedSupplier.name} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editContact">Nama Kontak</Label>
                  <Input id="editContact" name="contact" required defaultValue={selectedSupplier.contact} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Telepon</Label>
                  <Input id="editPhone" name="phone" required defaultValue={selectedSupplier.phone} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input id="editEmail" name="email" type="email" required defaultValue={selectedSupplier.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editAddress">Alamat</Label>
                <Textarea id="editAddress" name="address" required defaultValue={selectedSupplier.address} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editSupplierStatus">Status</Label>
                <Select name="status" required defaultValue={selectedSupplier.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Borrowing Management Component
function BorrowingManagement({
  user,
  items,
  transactions,
  refreshData,
  suppliers,
}: {
  user: User
  items: Item[]
  transactions: Transaction[]
  refreshData: () => void
  suppliers: Supplier[]
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all")
  const { toast } = useToast()

  // Filter borrowing transactions only
  const borrowingTransactions = transactions.filter((t) => t.type === "borrow")

  const filteredTransactions = borrowingTransactions.filter((transaction) => {
    const item = items.find((i) => i.id === transaction.itemId)
    const matchesSearch =
      searchTerm === "" ||
      item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.borrowerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.notes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatusFilter === "all" || transaction.status === selectedStatusFilter
    return matchesSearch && matchesStatus
  })

  const handleAddBorrowing = async (formData: FormData) => {
    formData.append("type", "borrow") // Ensure type is set for generic action
    const result = await createTransaction(formData, user.id) // Use generic createTransaction
    if (result.success) {
      setIsAddDialogOpen(false)
      toast({ title: "Peminjaman Ditambahkan", description: result.message })
      // Refresh data immediately to show new borrowing
      await refreshData()
    } else {
      toast({ title: "Gagal Menambah Peminjaman", description: result.message, variant: "destructive" })
    }
  }

  const handleEditBorrowing = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditDialogOpen(true)
  }

  const handleUpdateBorrowing = async (formData: FormData) => {
    if (!selectedTransaction) return
    formData.append("id", selectedTransaction.id.toString())
    formData.append("type", selectedTransaction.type)
    formData.append("userId", selectedTransaction.userId.toString())
    formData.append("date", selectedTransaction.date)
    const result = await updateTransaction(formData) // Use generic updateTransaction
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedTransaction(null)
      toast({ title: "Peminjaman Diperbarui", description: result.message })
      // Refresh data immediately to show updated borrowing
      await refreshData()
    } else {
      toast({ title: "Gagal Memperbarui Peminjaman", description: result.message, variant: "destructive" })
    }
  }

  const handleDeleteBorrowing = async (id: number) => {
    const result = await deleteTransaction(id) // Use generic deleteTransaction
    if (result.success) {
      toast({ title: "Peminjaman Dihapus", description: result.message, variant: "destructive" })
      // Refresh data immediately to remove deleted borrowing
      await refreshData()
    } else {
      toast({ title: "Gagal Menghapus Peminjaman", description: result.message, variant: "destructive" })
    }
  }

  const handleReturnItem = async (transactionId: number) => {
    const result = await returnBorrowing(transactionId)
    if (result.success) {
      toast({ title: "Peminjaman Dikembalikan", description: result.message })
      // Refresh data immediately to show returned item
      await refreshData()
    } else {
      toast({ title: "Gagal Mengembalikan Barang", description: result.message, variant: "destructive" })
    }
  }

  const handleExportBorrowings = () => {
    const headers = [
      "id",
      "type",
      "itemId",
      "quantity",
      "userId",
      "borrowerId",
      "notes",
      "status",
      "date",
      "dueDate",
      "returnDate",
    ]
    const exportData = transactions.filter((t) => t.type === "borrow" || t.type === "return")
    downloadCsv(exportData, "borrowings_data.csv", headers, toast)
  }

  const handleImportBorrowings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        let successCount = 0
        let errorCount = 0

        for (const row of importedData) {
          const formData = new FormData()
          formData.append("type", row.type || "borrow") // Default to borrow if not specified
          formData.append("itemId", row.itemId)
          formData.append("quantity", row.quantity)
          formData.append("borrowerId", row.borrowerId || "")
          formData.append("notes", row.notes || "")
          formData.append("dueDate", row.dueDate || "")

          const result = await createTransaction(formData, user.id)
          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast({
              title: "Import Sebagian Gagal",
              description: `Gagal mengimpor baris untuk item ID ${row.itemId}: ${result.message}`,
              variant: "destructive",
            })
          }
        }

        if (successCount > 0) {
          await refreshData() // Refresh data immediately after import
          toast({
            title: "Import Selesai",
            description: `${successCount} transaksi peminjaman berhasil diimpor, ${errorCount} gagal.`,
          })
        } else if (errorCount > 0) {
          toast({
            title: "Import Gagal Total",
            description: `Tidak ada transaksi peminjaman yang berhasil diimpor.`,
            variant: "destructive",
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  // Get borrowing statistics
  const totalBorrowed = filteredTransactions.reduce((sum, t) => sum + t.quantity, 0)
  const activeBorrowings = filteredTransactions.filter((t) => t.status === "pending").length
  const overdueBorrowings = filteredTransactions.filter(
    (t) => t.status === "pending" && t.dueDate && new Date(t.dueDate) < new Date(),
  ).length
  const completedBorrowings = filteredTransactions.filter((t) => t.status === "completed").length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Peminjaman</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola peminjaman barang hotel</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExportBorrowings} size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportBorrowings}
            className="hidden"
            id="import-borrowings-csv"
          />
          <Button
            onClick={() => document.getElementById("import-borrowings-csv")?.click()}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Peminjaman
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Peminjaman Baru</DialogTitle>
                <DialogDescription>Masukkan informasi peminjaman</DialogDescription>
              </DialogHeader>
              <form action={handleAddBorrowing} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId">Barang</Label>
                  <Select name="itemId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items
                        .filter((item) => item.currentStock > 0)
                        .map((item) => {
                          const supplier = suppliers.find((s) => s.id === item.supplierId)
                          return (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name} (Stok: {item.currentStock}) - {supplier?.name || "N/A"}
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input id="quantity" name="quantity" type="number" required min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="borrowerId">Peminjam</Label>
                    <Input id="borrowerId" name="borrowerId" placeholder="Room 101, Dept. HK, dll" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Tanggal Kembali</Label>
                  <Input id="dueDate" name="dueDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Borrowing Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Card className="bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dipinjam</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalBorrowed} unit</div>
            <p className="text-xs text-white/80">Total barang yang dipinjam</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Dipinjam</CardTitle>
            <Package className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeBorrowings}</div>
            <p className="text-xs text-white/80">Peminjaman aktif</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <AlertTriangle className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{overdueBorrowings}</div>
            <p className="text-xs text-white/80">Peminjaman terlambat</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dikembalikan</CardTitle>
            <CheckCircle className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedBorrowings}</div>
            <p className="text-xs text-white/80">Peminjaman selesai</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari barang atau peminjam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Dipinjam</SelectItem>
            <SelectItem value="completed">Dikembalikan</SelectItem>
            <SelectItem value="cancelled">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Borrowing Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead className="hidden sm:table-cell">Supplier</TableHead>
                  <TableHead className="hidden sm:table-cell">Jumlah</TableHead>
                  <TableHead>Peminjam</TableHead>
                  <TableHead className="hidden md:table-cell">Tanggal Kembali</TableHead>
                  <TableHead>Status</TableHead>
                  {(user.role === "admin" || user.role === "manager") && <TableHead className="w-24">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || selectedStatusFilter !== "all"
                          ? "Tidak ada peminjaman yang sesuai dengan pencarian"
                          : "Belum ada data peminjaman. Tambahkan peminjaman pertama Anda!"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const item = items.find((i) => i.id === transaction.itemId)
                    const supplier = suppliers.find((s) => s.id === item?.supplierId)
                    const isOverdue =
                      transaction.dueDate &&
                      new Date(transaction.dueDate) < new Date() &&
                      transaction.status !== "completed"

                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">{transaction.date}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm truncate max-w-32">{item?.name}</p>
                            <p className="text-xs text-gray-500 hidden sm:block">{item?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div>
                            <p className="text-sm truncate max-w-24">{supplier?.name || "N/A"}</p>
                            <p className="text-xs text-gray-500">{supplier?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {transaction.quantity} {item?.unit}
                        </TableCell>
                        <TableCell className="text-sm truncate max-w-24">{transaction.borrowerId}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className={`text-sm ${isOverdue ? "text-red-600" : ""}`}>
                            {transaction.dueDate}
                            {isOverdue && <p className="text-xs">Terlambat!</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                  ? "secondary"
                                  : isOverdue
                                    ? "destructive"
                                    : "secondary"
                            }
                            className="text-xs"
                          >
                            {transaction.status === "completed"
                              ? "Dikembalikan"
                              : transaction.status === "pending"
                                ? "Dipinjam"
                                : transaction.status}
                          </Badge>
                        </TableCell>
                        {(user.role === "admin" || user.role === "manager") && (
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-1">
                              {transaction.status !== "completed" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReturnItem(transaction.id)}
                                  className="text-xs px-2 py-1"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Kembalikan
                                </Button>
                              )}
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => handleEditBorrowing(transaction)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteBorrowing(transaction.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Borrowing Dialog */}
      {selectedTransaction && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Peminjaman</DialogTitle>
              <DialogDescription>Perbarui informasi peminjaman</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateBorrowing} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editItemId">Barang</Label>
                <Select name="itemId" required defaultValue={selectedTransaction.itemId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => {
                      const supplier = suppliers.find((s) => s.id === item.supplierId)
                      return (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} (Stok: {item.currentStock}) - {supplier?.name || "N/A"}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editQuantity">Jumlah</Label>
                  <Input
                    id="editQuantity"
                    name="quantity"
                    type="number"
                    required
                    min="1"
                    defaultValue={selectedTransaction.quantity}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editBorrowerId">Peminjam</Label>
                  <Input
                    id="editBorrowerId"
                    name="borrowerId"
                    placeholder="Room 101, Dept. HK, dll"
                    required
                    defaultValue={selectedTransaction.borrowerId}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDueDate">Tanggal Kembali</Label>
                <Input
                  id="editDueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={selectedTransaction.dueDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editNotes">Catatan</Label>
                <Textarea id="editNotes" name="notes" defaultValue={selectedTransaction.notes} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editStatus">Status</Label>
                <Select name="status" required defaultValue={selectedTransaction.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Dipinjam</SelectItem>
                    <SelectItem value="completed">Dikembalikan</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Depreciation Management Component
function DepreciationManagement({
  user,
  items,
  depreciations,
  refreshData,
}: {
  user: User
  items: Item[]
  depreciations: Depreciation[]
  refreshData: () => void
}) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDepreciation, setSelectedDepreciation] = useState<Depreciation | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all")
  const { toast } = useToast()
  const router = useRouter()

  const handleAddDepreciation = async (formData: FormData) => {
    const result = await createDepreciation(formData, user.id)
    if (result.success) {
      setIsAddDialogOpen(false)
      toast({ title: "Penyusutan Dicatat", description: result.message })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Mencatat Penyusutan", description: result.message, variant: "destructive" })
    }
  }

  const handleEditDepreciation = (depreciation: Depreciation) => {
    setSelectedDepreciation(depreciation)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDepreciation = async (formData: FormData) => {
    if (!selectedDepreciation) return
    formData.append("id", selectedDepreciation.id.toString())
    formData.append("date", selectedDepreciation.date)
    formData.append("userId", selectedDepreciation.userId.toString())
    const result = await updateDepreciation(formData)
    if (result.success) {
      setIsEditDialogOpen(false)
      setSelectedDepreciation(null)
      toast({ title: "Penyusutan Diperbarui", description: result.message })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Memperbarui Penyusutan", description: result.message, variant: "destructive" })
    }
  }

  const handleDeleteDepreciation = async (id: number) => {
    const result = await deleteDepreciation(id)
    if (result.success) {
      toast({ title: "Penyusutan Dihapus", description: result.message, variant: "destructive" })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Menghapus Penyusutan", description: result.message, variant: "destructive" })
    }
  }

  const getDepreciationData = (dep: Depreciation) => {
    const item = items.find((i) => i.id === dep.itemId)
    return {
      ...dep,
      itemName: item?.name,
      itemCode: item?.code,
      itemUnit: item?.unit,
      itemPrice: item?.price,
    }
  }

  const filteredAndMappedDepreciations = depreciations.map(getDepreciationData).filter((dep) => {
    const matchesSearch =
      searchTerm === "" ||
      dep.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatusFilter === "all" || dep.status === selectedStatusFilter
    return matchesSearch && matchesStatus
  })

  const totalDepreciatedQuantity = filteredAndMappedDepreciations.reduce((sum, dep) => sum + dep.quantity, 0)
  const totalDepreciatedValue = filteredAndMappedDepreciations.reduce((sum, dep) => {
    return sum + (dep.itemPrice ? dep.quantity * dep.itemPrice : 0)
  }, 0)
  const totalDepreciationRecords = filteredAndMappedDepreciations.length

  const handleExportDepreciations = () => {
    const headers = ["id", "itemId", "quantity", "date", "reason", "userId", "status"]
    downloadCsv(depreciations, "depreciations_data.csv", toast)
  }

  const handleImportDepreciations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length) {
          toast({
            title: "Import Gagal",
            description: `Ada kesalahan dalam parsing CSV: ${results.errors[0].message}`,
            variant: "destructive",
          })
          return
        }

        const importedData = results.data as Record<string, string>[]
        let successCount = 0
        let errorCount = 0

        for (const row of importedData) {
          const formData = new FormData()
          formData.append("itemId", row.itemId)
          formData.append("quantity", row.quantity)
          formData.append("reason", row.reason)
          // userId and status are handled by the action or DB defaults
          // formData.append("userId", row.userId)
          // formData.append("status", row.status || "completed")

          const result = await createDepreciation(formData, user.id) // Pass user.id for the creator
          if (result.success) {
            successCount++
          } else {
            errorCount++
            toast({
              title: "Import Sebagian Gagal",
              description: `Gagal mengimpor baris untuk item ID ${row.itemId}: ${result.message}`,
              variant: "destructive",
            })
          }
        }

        if (successCount > 0) {
          await refreshData() // Call refreshData
          toast({
            title: "Import Berhasil",
            description: `${successCount} catatan penyusutan berhasil diimpor, ${errorCount} gagal.`,
          })
        } else if (errorCount > 0) {
          toast({
            title: "Import Gagal Total",
            description: `Tidak ada catatan penyusutan yang berhasil diimpor.`,
            variant: "destructive",
          })
        }
      },
      error: (error) => {
        toast({
          title: "Import Gagal",
          description: `Terjadi kesalahan saat membaca file: ${error.message}`,
          variant: "destructive",
        })
      },
    })
  }

  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Penyusutan Barang</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola pencatatan penyusutan barang</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleExportDepreciations} size="sm" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportDepreciations}
            className="hidden"
            id="import-depreciations-csv"
          />
          <Button
            onClick={() => document.getElementById("import-depreciations-csv")?.click()}
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Catat Penyusutan
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Catat Penyusutan Barang</DialogTitle>
                <DialogDescription>Masukkan detail barang yang disusutkan</DialogDescription>
              </DialogHeader>
              <form action={handleAddDepreciation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId">Barang</Label>
                  <Select name="itemId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} (Stok: {item.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Jumlah</Label>
                  <Input id="quantity" name="quantity" type="number" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Alasan Penyusutan</Label>
                  <Textarea id="reason" name="reason" placeholder="Contoh: Rusak, Hilang, Kadaluarsa" required />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card className="bg-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang Disusutkan</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDepreciatedQuantity} unit</div>
            <p className="text-xs text-white/80">Jumlah total barang yang disusutkan</p>
          </CardContent>
        </Card>
        <Card className="bg-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Penyusutan</CardTitle>
            <Package className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">Rp {totalDepreciatedValue.toLocaleString()}</div>
            <p className="text-xs text-white/80">Estimasi nilai total barang yang disusutkan</p>
          </CardContent>
        </Card>
        <Card className="bg-red-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Catatan</CardTitle>
            <BarChart3 className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDepreciationRecords}</div>
            <p className="text-xs text-white/80">Total catatan penyusutan</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari alasan atau barang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStatusFilter} onValueChange={setSelectedStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Depreciation Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Barang</TableHead>
                  <TableHead className="hidden sm:table-cell">Jumlah</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  {(user.role === "admin" || user.role === "manager") && <TableHead className="w-20">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndMappedDepreciations.map((dep) => (
                  <TableRow key={dep.id}>
                    <TableCell className="text-sm">{dep.date}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-32">{dep.itemName}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">{dep.itemCode}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">
                      {dep.quantity} {dep.itemUnit}
                    </TableCell>
                    <TableCell className="text-sm truncate max-w-32">{dep.reason}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant={dep.status === "completed" ? "default" : "secondary"} className="text-xs">
                        {dep.status === "completed" ? "Selesai" : "Pending"}
                      </Badge>
                    </TableCell>
                    {(user.role === "admin" || user.role === "manager") && (
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditDepreciation(dep)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDepreciation(dep.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Depreciation Dialog */}
      {selectedDepreciation && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Penyusutan</DialogTitle>
              <DialogDescription>Perbarui detail penyusutan barang</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateDepreciation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editDepreciationItemId">Barang</Label>
                <Select name="itemId" required defaultValue={selectedDepreciation.itemId.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name} (Stok: {item.currentStock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepreciationQuantity">Jumlah</Label>
                <Input
                  id="editDepreciationQuantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  defaultValue={selectedDepreciation.quantity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepreciationReason">Alasan Penyusutan</Label>
                <Textarea
                  id="editDepreciationReason"
                  name="reason"
                  placeholder="Contoh: Rusak, Hilang, Kadaluarsa"
                  required
                  defaultValue={selectedDepreciation.reason}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepreciationStatus">Status</Label>
                <Select name="status" required defaultValue={selectedDepreciation.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// User Management Component (Admin only)
function UserManagement({ user, users, refreshData }: { user: User; users: User[]; refreshData: () => void }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<User>>({})
  const { toast } = useToast()
  // Removed useRouter as refreshData prop will handle data refresh

  const handleAddUser = async (formData: FormData) => {
    const result = await createUser(formData)
    if (result.success) {
      setIsAddDialogOpen(false)
      toast({ title: "Pengguna Ditambahkan", description: result.message })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Menambah Pengguna", description: result.message, variant: "destructive" })
    }
  }

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit)
    setEditFormData(userToEdit)
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    const formData = new FormData()
    formData.append("id", editingUser.id.toString())
    formData.append("username", editFormData.username || "")
    formData.append("name", editFormData.name || "")
    formData.append("email", editFormData.email || "")
    formData.append("role", editFormData.role || "")
    formData.append("status", editFormData.status || "")
    formData.append("lastLogin", editingUser.lastLogin) // Pass original lastLogin

    const result = await updateUser(formData)
    if (result.success) {
      setEditingUser(null)
      setEditFormData({})
      toast({ title: "Pengguna Diperbarui", description: result.message })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Memperbarui Pengguna", description: result.message, variant: "destructive" })
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditFormData({})
  }

  const handleDeleteUser = async (id: number) => {
    const result = await deleteUser(id)
    if (result.success) {
      toast({ title: "Pengguna Dihapus", description: result.message, variant: "destructive" })
      await refreshData() // Call refreshData
    } else {
      toast({ title: "Gagal Menghapus Pengguna", description: result.message, variant: "destructive" })
    }
  }

  if (user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold">Data Pengguna</h2>
          <p className="text-sm sm:text-base text-gray-600">Kelola pengguna sistem</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {editingUser && (
            <>
              <Button onClick={handleUpdateUser} disabled={!editingUser} size="sm" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Simpan Perubahan
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                size="sm"
                className="w-full sm:w-auto bg-transparent"
              >
                Batal
              </Button>
            </>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengguna
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                <DialogDescription>Masukkan informasi pengguna baru</DialogDescription>
              </DialogHeader>
              <form action={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead className="hidden sm:table-cell">Nama</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden xl:table-cell">Last Login</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="hidden sm:table-cell truncate max-w-32">{u.name}</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-40">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "admin" ? "default" : u.role === "manager" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={u.status === "active" ? "default" : "destructive"} className="text-xs">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">{u.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(u)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        {u.role !== "admin" && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Form (appears below table) */}
      {editingUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Edit Pengguna: {editingUser.name}</CardTitle>
            <CardDescription>Perbarui informasi pengguna</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editUsername">Username</Label>
                  <Input
                    id="editUsername"
                    name="username"
                    required
                    value={editFormData.username || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editName">Nama Lengkap</Label>
                  <Input
                    id="editName"
                    name="name"
                    required
                    value={editFormData.name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  name="email"
                  type="email"
                  required
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editRole">Role</Label>
                  <Select
                    name="role"
                    required
                    value={editFormData.role || ""}
                    onValueChange={(value) => setEditFormData({ ...editFormData, role: value as User["role"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    name="status"
                    required
                    value={editFormData.status || ""}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value as User["status"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Settings Management Component
export function SettingsManagement({
  currentUser,
  refreshData, // Added refreshData prop
}: {
  currentUser: User
  refreshData: () => void // Added refreshData prop type
}) {
  const [username, setUsername] = useState(currentUser.username)
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [role, setRole] = useState(currentUser.role)
  const [status, setStatus] = useState(currentUser.status)
  const { toast } = useToast()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("id", currentUser.id.toString())
    formData.append("username", username)
    formData.append("name", name)
    formData.append("email", email)
    formData.append("role", role)
    formData.append("status", status)
    formData.append("lastLogin", currentUser.lastLogin) // Keep original lastLogin

    const result = await updateUser(formData)
    if (result.success && result.user) {
      // setUsers((prevUsers) => prevUsers.map((u) => (u.id === result.user!.id ? result.user! : u))) // Removed as refreshData will handle this
      toast({
        title: "Profil Diperbarui",
        description: "Informasi profil Anda berhasil diperbarui.",
      })
      await refreshData() // Call refreshData to update the main app state
    } else {
      toast({
        title: "Gagal Memperbarui Profil",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold">Pengaturan Akun</h2>
        <p className="text-sm sm:text-base text-gray-600">Kelola informasi profil Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Profil</CardTitle>
          <CardDescription>Perbarui detail akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value) => setRole(value as User["role"])} disabled>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as User["status"])} disabled>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Additional settings sections can be added here */}
      {/* Example: Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ubah Kata Sandi</CardTitle>
          <CardDescription>Perbarui kata sandi akun Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Kata Sandi Baru</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi Baru</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button type="submit" variant="outline" className="w-full sm:w-auto bg-transparent">
              Ubah Kata Sandi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Application Component
export default function HotelInventorySystem() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState("dashboard")
  // Removed sidebarOpen state as SidebarProvider manages it internally or via controlled props

  // States for all main data
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [depreciations, setDepreciations] = useState<Depreciation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [logEntries, setLogEntries] = useState<LogEntry[]>([
    {
      id: 1,
      date: "2024-07-15",
      itemId: 1, // Bath Towel Baru
      outQuantity: 5,
      inQuantity: 0,
      pendingQuantity: 2,
      returnedQuantity: 0,
    },
    {
      id: 2,
      date: "2024-07-15",
      itemId: 2, // Bath Towel Lama
      outQuantity: 3,
      inQuantity: 10,
      pendingQuantity: 0,
      returnedQuantity: 0,
    },
    {
      id: 3,
      date: "2024-07-16",
      itemId: 1, // Bath Towel Baru
      outQuantity: 3,
      inQuantity: 0,
      pendingQuantity: 1,
      returnedQuantity: 0,
    },
    {
      id: 4,
      date: "2024-07-16",
      itemId: 4, // Bed Sheet Single
      outQuantity: 2,
      inQuantity: 0,
      pendingQuantity: 5,
      returnedQuantity: 0,
    },
    {
      id: 5,
      date: "2024-07-17",
      itemId: 5, // Bed Sheet Double
      outQuantity: 4,
      inQuantity: 5,
      pendingQuantity: 0,
      returnedQuantity: 0,
    },
    {
      id: 6,
      date: "2024-07-17",
      itemId: 8, // Pillow Case Baru
      outQuantity: 6,
      inQuantity: 2,
      pendingQuantity: 1,
      returnedQuantity: 0,
    },
  ])
  const [notifications, setNotifications] = useState<
    Array<{
      id: number
      title: string
      message: string
      type: "info" | "warning" | "error" | "success"
      timestamp: string
      read: boolean
    }>
  >([])
  const [showNotifications, setShowNotifications] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  // Function to refresh all data
  const refreshAllData = async () => {
    try {
      const [
        fetchedUsers,
        fetchedItems,
        fetchedSuppliers,
        fetchedTransactions,
        fetchedDepreciations,
        fetchedCategories,
      ] = await Promise.all([
        fetchUsers(),
        fetchItems(),
        fetchSuppliers(),
        fetchTransactions(),
        fetchDepreciations(),
        fetchCategories(),
      ])

      setUsers(fetchedUsers)
      setItems(fetchedItems)
      setSuppliers(fetchedSuppliers)
      setTransactions(fetchedTransactions)
      setDepreciations(fetchedDepreciations)
      setCategories(fetchedCategories)

      router.refresh() // Trigger Next.js router refresh for server components
    } catch (error) {
      console.error("Failed to load initial data:", error)
      toast({
        title: "Gagal Memuat Data",
        description: "Terjadi kesalahan saat memuat data awal.",
        variant: "destructive",
      })
    }
  }

  // Load initial data using Server Actions
  useEffect(() => {
    refreshAllData()
  }, []) // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (items.length > 0 && transactions.length > 0) {
      const newNotifications = []
      let notificationId = 1

      // Notifikasi stok rendah
      const lowStockItems = items.filter((item) => item.currentStock <= item.minStock)
      lowStockItems.forEach((item) => {
        newNotifications.push({
          id: notificationId++,
          title: "Stok Rendah",
          message: `${item.name} memiliki stok rendah (${item.currentStock} ${item.unit})`,
          type: "warning" as const,
          timestamp: new Date().toLocaleString(),
          read: false,
        })
      })

      // Notifikasi peminjaman terlambat
      const overdueBorrowings = transactions.filter(
        (t) => t.type === "borrow" && t.status !== "completed" && t.dueDate && new Date(t.dueDate) < new Date(),
      )
      overdueBorrowings.forEach((transaction) => {
        const item = items.find((i) => i.id === transaction.itemId)
        newNotifications.push({
          id: notificationId++,
          title: "Peminjaman Terlambat",
          message: `${item?.name || "Barang"} dipinjam oleh ${transaction.borrowerId} sudah melewati batas waktu`,
          type: "error" as const,
          timestamp: new Date().toLocaleString(),
          read: false,
        })
      })

      // Notifikasi transaksi pending
      const pendingTransactions = transactions.filter((t) => t.status === "pending")
      if (pendingTransactions.length > 0) {
        newNotifications.push({
          id: notificationId++,
          title: "Transaksi Pending",
          message: `Ada ${pendingTransactions.length} transaksi yang menunggu persetujuan`,
          type: "info" as const,
          timestamp: new Date().toLocaleString(),
          read: false,
        })
      }

      setNotifications(newNotifications)
    }
  }, [items, transactions])

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showNotifications && !target.closest(".relative")) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  if (!currentUser) {
    return <LoginForm onLogin={setCurrentUser} />
  }

  const navigationItems = getNavigationItems(currentUser.role)

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            user={currentUser}
            items={items}
            users={users}
            suppliers={suppliers}
            transactions={transactions}
            setCurrentPage={setCurrentPage}
          />
        )
      case "items":
        return (
          <ItemsManagement
            user={currentUser}
            items={items}
            suppliers={suppliers}
            refreshData={refreshAllData}
            categories={categories}
            setCurrentPage={setCurrentPage}
          />
        )
      case "categories":
        return (
          <CategoryManagement
            user={currentUser}
            categories={categories}
            items={items}
            refreshData={refreshAllData}
            setCurrentPage={setCurrentPage}
          />
        )
      case "suppliers":
        return (
          <SuppliersManagement
            user={currentUser}
            suppliers={suppliers}
            refreshData={refreshAllData}
            transactions={transactions}
            items={items}
          />
        )
      case "borrowing":
        return (
          <BorrowingManagement
            user={currentUser}
            items={items}
            transactions={transactions}
            refreshData={refreshAllData}
            suppliers={suppliers}
          />
        )
      case "depreciation":
        return (
          <DepreciationManagement
            user={currentUser}
            items={items}
            depreciations={depreciations}
            refreshData={refreshAllData}
          />
        )
      case "items-in":
        return (
          <ItemsInManagement
            user={currentUser}
            items={items}
            suppliers={suppliers}
            transactions={transactions}
            refreshData={refreshAllData}
          />
        )
      case "items-out":
        return (
          <ItemsOutManagement
            user={currentUser}
            items={items}
            transactions={transactions}
            refreshData={refreshAllData}
            suppliers={suppliers}
          />
        )
      case "locations":
        return <LocationManagement user={currentUser} items={items} refreshData={refreshAllData} />
      case "users":
        return <UserManagement user={currentUser} users={users} refreshData={refreshAllData} />
      case "reports":
        return (
          <ReportsManagement
            user={currentUser}
            items={items}
            suppliers={suppliers}
            transactions={transactions}
            depreciations={depreciations}
            users={users}
          />
        )
      case "settings":
        return <SettingsManagement currentUser={currentUser} refreshData={refreshAllData} />
      case "loog-book":
        return (
          <LoogBookManagement
            user={currentUser}
            items={items}
            transactions={transactions}
            logEntries={logEntries}
            setLogEntries={setLogEntries}
          />
        )
      case "cost-control":
        return <CostControlManagement user={currentUser} logBookEntries={logEntries} />
      case "invoice":
        return <InvoiceManagement user={currentUser} logEntries={logEntries} items={items} />
      case "guest-laundry":
        return <GuestLaundryManagement user={currentUser} />
      default:
        return (
          <Dashboard
            user={currentUser}
            items={items}
            users={users}
            suppliers={suppliers}
            transactions={transactions}
            setCurrentPage={setCurrentPage}
          />
        )
    }
  }

  // Helper function to render navigation items recursively
  const renderNavigationItems = (items: ReturnType<typeof getNavigationItems>) => {
    return (
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.key}>
            {item.children ? (
              <Collapsible defaultOpen={currentPage.startsWith(item.key)} className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton isActive={currentPage.startsWith(item.key)}>
                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                    <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.children.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.key}>
                        {subItem.children ? (
                          <Collapsible defaultOpen={currentPage.startsWith(subItem.key)} className="group/collapsible">
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton isActive={currentPage.startsWith(subItem.key)}>
                                {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                                <span className="truncate">{subItem.title}</span>
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {subItem.children.map((nestedSubItem) => (
                                  <SidebarMenuSubItem key={nestedSubItem.key}>
                                    <SidebarMenuSubButton
                                      onClick={() => {
                                        setCurrentPage(nestedSubItem.key)
                                        // setSidebarOpen(false) // No longer needed with internal state management
                                      }}
                                      isActive={currentPage === nestedSubItem.key}
                                    >
                                      {nestedSubItem.icon && <nestedSubItem.icon className="w-4 h-4 mr-2" />}
                                      <span className="truncate">{nestedSubItem.title}</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <SidebarMenuSubButton
                            onClick={() => {
                              setCurrentPage(subItem.key)
                              // setSidebarOpen(false) // No longer needed with internal state management
                            }}
                            isActive={currentPage === subItem.key}
                          >
                            {subItem.icon && <subItem.icon className="w-4 h-4 mr-2" />}
                            <span className="truncate">{subItem.title}</span>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuButton
                onClick={() => {
                  setCurrentPage(item.key)
                  // setSidebarOpen(false) // No longer needed with internal state management
                }}
                isActive={currentPage === item.key}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate">{item.title}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          collapsible="offcanvas" // Use offcanvas for mobile, icon for desktop if desired
          side="left" // Explicitly set side to left
          className="bg-gradient-to-b from-[#25282A] to-[#25282A]" // Apply background here
        >
          <SidebarHeader>
            <div className="flex items-center space-x-3 w-full p-2">
              <div className="w-28 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden p-2 flex-shrink-0 shadow-sm">
                <img
                  src="/images/ramayana-logo-new.png"
                  alt="Ramayana Hotel Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white flex-1 leading-tight">
                INVENTARIS
                <br />
                HOUSEKEEPING
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>{renderNavigationItems(navigationItems)}</SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <p className="text-xs text-gray-400">{currentUser.role.toUpperCase()}</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-[#F0D58D] hover:text-[#25282A]"
              onClick={() => setCurrentUser(null)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              LOGOUT
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content wrapped in SidebarInset */}
        <SidebarInset>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger className="lg:hidden" /> {/* Use SidebarTrigger for mobile */}
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate max-w-xs sm:max-w-none">
                    {navigationItems.find((i) => i.key === currentPage)?.title || "Dashboard"}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Hotel Management System</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input placeholder="Search..." className="pl-10 w-40 lg:w-64" />
                </div>

                {/* Notification Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.filter((n) => !n.read).length}
                      </span>
                    )}
                  </Button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Notifikasi</h3>
                        {notifications.filter((n) => !n.read).length > 0 && (
                          <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs">
                            Tandai Semua Dibaca
                          </Button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>Tidak ada notifikasi</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                    notification.type === "error"
                                      ? "bg-red-500"
                                      : notification.type === "warning"
                                        ? "bg-yellow-500"
                                        : notification.type === "success"
                                          ? "bg-green-500"
                                          : "bg-blue-500"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className={`text-sm font-medium ${
                                        !notification.read ? "text-gray-900" : "text-gray-600"
                                      }`}
                                    >
                                      {notification.title}
                                    </p>
                                    <p
                                      className={`text-sm mt-1 ${!notification.read ? "text-gray-700" : "text-gray-500"}`}
                                    >
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => setShowNotifications(false)}
                          >
                            Tutup Notifikasi
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Badge variant="secondary" className="hidden sm:inline-flex bg-green-100 text-green-800">
                  {currentUser.role.toUpperCase()}
                </Badge>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6">{renderCurrentPage()}</main>
        </SidebarInset>

        {/* Mobile Sidebar Overlay */}
        {/* This overlay is still needed for mobile when the sidebar is "offcanvas" */}
        {/* The Sidebar component itself manages its open/close state for mobile via Sheet */}
        {/* This overlay is for when the Sheet is open, to dim the background */}
        {/* We need to get the openMobile state from useSidebar to control this overlay */}
        {/* For now, I'll keep the original sidebarOpen logic for the overlay, but ideally it should come from useSidebar().openMobile */}
        {/* Since we removed the sidebarOpen state, we need to re-introduce a way to control this overlay */}
        {/* Let's get openMobile from useSidebar and use it for the overlay */}
      </div>
    </SidebarProvider>
  )
}
