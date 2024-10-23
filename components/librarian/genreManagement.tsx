"use client"

import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Genre {
  GenreId: number
  GenreName: string
  IsArchived: number
}

export default function GenreManagement() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [archivedGenres, setArchivedGenres] = useState<Genre[]>([])
  const [newGenreName, setNewGenreName] = useState("")
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchGenres()
    fetchArchivedGenres()
  }, [])

  const fetchGenres = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("operation", "fetchGenres")
      const response = await axios.post("http://localhost/library_api/php/genre.php", formData)
      setGenres(response.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch genres", variant: "destructive" })
    }
    setLoading(false)
  }

  const fetchArchivedGenres = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("operation", "fetchArchivedGenres")
      const response = await axios.post("http://localhost/library_api/php/genre.php", formData)
      setArchivedGenres(response.data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch archived genres", variant: "destructive" })
    }
    setLoading(false)
  }

  const addGenre = async () => {
    try {
      const formData = new FormData()
      formData.append("operation", "addGenre")
      formData.append("json", JSON.stringify({ genreName: newGenreName }))
      const response = await axios.post("http://localhost/library_api/php/genre.php", formData)
      if (response.data.success) {
        toast({ title: "Success", description: response.data.message })
        fetchGenres()
        setNewGenreName("")
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add genre", variant: "destructive" })
    }
  }

  const updateGenre = async ($genreId: any, $genreName: any) => {
    if (!editingGenre) return
    try {
      const formData = new FormData()
      formData.append("operation", "updateGenre")
      formData.append("json", JSON.stringify({ genreID: $genreId, genreName: $genreName }))
      const response = await axios.post("http://localhost/library_api/php/genre.php", formData)
      if (response.data.success) {
        toast({ title: "Success", description: response.data.message })
        fetchGenres()
        setEditingGenre(null)
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update genre", variant: "destructive" })
    }
  }

  const archiveGenre = async (genreID: number) => {
    try {
      const formData = new FormData()
      formData.append("operation", "archiveGenre")
      formData.append("json", JSON.stringify({ genreID }))
      const response = await axios.post("http://localhost/library_api/php/genre.php", formData)
      if (response.data.success) {
        toast({ title: "Success", description: response.data.message })
        fetchGenres()
        fetchArchivedGenres()
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to archive genre", variant: "destructive" })
    }
  }

  const restoreGenre = async (genreID: number) => {
    try {
      const formData = new FormData()
      formData.append("operation", "restoreGenre")
      formData.append("json", JSON.stringify({ genreID }))
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/genre.php`, formData)
      if (response.data.success) {
        toast({ title: "Success", description: response.data.message })
        fetchGenres()
        fetchArchivedGenres()
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to archive genre", variant: "destructive" })
    }
  }


  const sortGenres = (genresToSort: Genre[]) => {
    if (!sortOption) return genresToSort

    return [...genresToSort].sort((a, b) => {
      switch (sortOption) {
        case "name":
          return a.GenreName.localeCompare(b.GenreName)
        case "id":
          return a.GenreId - b.GenreId
        default:
          return 0
      }
    })
  }

  const filteredAndSortedGenres = useMemo(() => {
    const filtered = genres.filter((genre) =>
      genre.GenreName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return sortGenres(filtered)
  }, [genres, searchTerm, sortOption])

  const filteredAndSortedArchivedGenres = useMemo(() => {
    const filtered = archivedGenres.filter((genre) =>
      genre.GenreName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return sortGenres(filtered)
  }, [archivedGenres, searchTerm, sortOption])

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Genre Management</h1>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Genres</TabsTrigger>
            <TabsTrigger value="archived">Archived Genres</TabsTrigger>
          </TabsList>
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search genres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select onValueChange={(value) => setSortOption(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">ID</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <TabsContent value="active">
            <div className="mb-4 justify-between">
              <div className="flex space-x-2 justify-between">
                <Input
                  type="text"
                  placeholder="New Genre Name"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  className="mr-2"
                />
                <Button className="bg-green-400 hover:bg-green-600" onClick={addGenre}>Add Genre</Button>
              </div>
            </div>
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedGenres.filter(genre => genre.IsArchived == 0).map((genre) => (
                      <TableRow key={genre.GenreId}>
                        <TableCell>{genre.GenreId}</TableCell>
                        <TableCell>{genre.GenreName}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="mr-2">Edit</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Genre</DialogTitle>
                              </DialogHeader>
                              <Input
                                type="text"
                                value={editingGenre?.GenreName || ""}
                                onChange={(e) => setEditingGenre({ ...editingGenre!, GenreName: e.target.value })}
                                className="mb-4"
                              />
                              <Button onClick={() => updateGenre(genre.GenreId, editingGenre?.GenreName)}>Save Changes</Button>
                            </DialogContent>
                          </Dialog>
                          <Button variant="destructive" onClick={() => archiveGenre(genre.GenreId)}>Archive</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="archived">
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedArchivedGenres.map((genre) => (
                      <TableRow key={genre.GenreId}>
                        <TableCell>{genre.GenreId}</TableCell>
                        <TableCell>{genre.GenreName}</TableCell>
                        <TableCell>
                          <Button onClick={() => restoreGenre(genre.GenreId)}>Restore</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}