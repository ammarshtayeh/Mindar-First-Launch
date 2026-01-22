"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Folder,
  FileText,
  Plus,
  MoreVertical,
  FolderPlus,
  Search,
  ArrowRight,
  Trash2,
  Edit2,
  Tag,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getFolders,
  getStudyMaterials,
  createFolder,
  deleteFolder,
  updateFolder,
  StudyMaterial,
  Folder as FolderType,
} from "@/lib/services/dbService";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function Library() {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (user) {
      loadLibrary();
    }
  }, [user, currentFolder]);

  const loadLibrary = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [f, m] = await Promise.all([
        getFolders(user.uid),
        getStudyMaterials(user.uid, currentFolder),
      ]);
      setFolders(f.filter((folder) => folder.parentId === currentFolder));
      setMaterials(m);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim()) return;
    await createFolder({
      name: newFolderName,
      userId: user.uid,
      parentId: currentFolder,
    });
    setNewFolderName("");
    setIsCreateModalOpen(false);
    loadLibrary();
  };

  const handleDeleteFolder = async (id: string) => {
    if (
      confirm(
        language === "ar"
          ? "هل أنت متأكد من حذف المجلد؟"
          : "Are you sure you want to delete this folder?",
      )
    ) {
      await deleteFolder(id);
      loadLibrary();
    }
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black">{t("library.title")}</h2>
          <p className="text-muted-foreground font-bold">
            {currentFolder
              ? folders.find((f) => f.id === currentFolder)?.name
              : t("library.root")}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="rounded-xl gap-2 font-bold"
          >
            <FolderPlus className="w-5 h-5" />
            {t("library.newFolder")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Breadcrumb / Back */}
        {currentFolder && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-1"
          >
            <Card
              onClick={() => setCurrentFolder(null)}
              className="h-full border-2 border-dashed hover:border-primary/40 cursor-pointer transition-all bg-primary/5 group"
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ArrowRight
                    className={cn(
                      "w-6 h-6",
                      language === "ar" ? "" : "rotate-180",
                    )}
                  />
                </div>
                <span className="font-black">{t("common.back")}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Folders */}
        {folders.map((folder) => (
          <motion.div
            key={folder.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="group border-2 hover:border-primary/40 cursor-pointer transition-all bg-card/50 backdrop-blur-sm overflow-hidden relative">
              <CardContent
                className="p-6 flex items-center gap-4"
                onClick={() => setCurrentFolder(folder.id)}
              >
                <div className="w-12 h-12 bg-yellow-400/20 text-yellow-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <Folder className="w-8 h-8 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-lg truncate">{folder.name}</h4>
                </div>
              </CardContent>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Edit2 className="w-4 h-4" /> {t("library.rename")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteFolder(folder.id)}
                    >
                      <Trash2 className="w-4 h-4" /> {t("library.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Materials */}
        {filteredMaterials.map((material) => (
          <motion.div
            key={material.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card
              onClick={() => router.push(`/checklist/${material.id}`)}
              className="group border-2 hover:border-primary/40 cursor-pointer transition-all bg-card/50 backdrop-blur-sm overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Tag className="w-4 h-4" /> {t("library.move")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-red-500">
                        <Trash2 className="w-4 h-4" /> {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h4 className="font-black text-lg line-clamp-2 mb-2">
                  {material.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {folders.length === 0 && materials.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground font-bold">
            {t("library.empty")}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              {t("library.newFolder")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder={t("library.folderName")}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="h-14 rounded-2xl text-lg font-bold"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl font-bold"
            >
              {t("common.back")}
            </Button>
            <Button
              onClick={handleCreateFolder}
              className="rounded-xl font-black px-8"
            >
              {t("library.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
