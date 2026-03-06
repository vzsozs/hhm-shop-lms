"use client";

import { useState } from "react";
import { useProductForm, ProductFormValues } from "../hooks/use-product-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductForm() {
  const { form, isPending, onSubmit, productType } = useProductForm();
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "AUDIO") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "IMAGE") setUploadingImage(true);
    if (type === "AUDIO") setUploadingAudio(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        const currentMedia = form.getValues("media") || [];
        form.setValue("media", [...currentMedia, { url: data.url, type }]);
      }
    } catch(err) {
      console.error(err);
    } finally {
      if (type === "IMAGE") setUploadingImage(false);
      if (type === "AUDIO") setUploadingAudio(false);
    }
  };

  const currentMedia = form.watch("media") || [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Új termék hozzáadása</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termék típusa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Válassz típust" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Fizikai termék</SelectItem>
                        <SelectItem value="digital">Digitális termék (LMS)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs defaultValue="hu" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hu">Magyar</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="sk">Slovensky</TabsTrigger>
              </TabsList>
              
              {(["hu", "en", "sk"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name={`name_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termék neve ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Input placeholder={`Név ${lang}-ul...`} {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`description_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leírás ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Input placeholder={`Leírás ${lang}-ul...`} {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU {productType === "physical" && "*"}</FormLabel>
                    <FormControl>
                      <Input placeholder="PL-123-ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceHuf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ár (HUF)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceEur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ár (EUR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {productType === "physical" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Logisztikai adatok</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Súly (kg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Szélesség (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magasság (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mélység (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold">Média és Fájlok</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormItem>
                  <FormLabel>Termékkép {uploadingImage && "(Feltöltés...)"}</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "IMAGE")} disabled={uploadingImage} />
                  </FormControl>
                  <div className="mt-2 space-y-1">
                    {currentMedia.filter(m => m.type === "IMAGE").map((m, i) => (
                      <div key={i} className="text-xs text-green-600 truncate bg-green-100 p-1 rounded font-mono">{m.url}</div>
                    ))}
                  </div>
                </FormItem>

                <FormItem>
                  <FormLabel>Hangfájl (.mp3) {uploadingAudio && "(Feltöltés...)"}</FormLabel>
                  <FormControl>
                    <Input type="file" accept="audio/mpeg" onChange={(e) => handleFileUpload(e, "AUDIO")} disabled={uploadingAudio} />
                  </FormControl>
                  <div className="mt-2 space-y-1">
                    {currentMedia.filter(m => m.type === "AUDIO").map((m, i) => (
                      <div key={i} className="text-xs text-green-600 truncate bg-green-100 p-1 rounded font-mono">{m.url}</div>
                    ))}
                  </div>
                </FormItem>

                <div className="space-y-2">
                  <FormLabel>YouTube Link</FormLabel>
                  <div className="flex gap-2">
                    <Input id="yt-link" placeholder="https://youtube.com/watch?v=..." />
                    <Button type="button" variant="outline" onClick={() => {
                      const input = document.getElementById("yt-link") as HTMLInputElement;
                      if (input && input.value) {
                         const currentMedia = form.getValues("media") || [];
                         form.setValue("media", [...currentMedia, { url: input.value, type: "YOUTUBE" }]);
                         input.value = "";
                      }
                    }}>Hozzáad</Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    {currentMedia.filter(m => m.type === "YOUTUBE").map((m, i) => (
                      <div key={i} className="text-xs text-green-600 truncate bg-green-100 p-1 rounded font-mono">{m.url}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Mentés..." : "Termék mentése"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
