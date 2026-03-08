export const productFormStyles = {
  // Alap hátterek és elrendezés
  container: "w-full bg-admin-bg border-none text-white",
  cardHeader: "flex flex-row items-center justify-between pb-4 border-b border-white/5",
  cardTitle: "text-xl font-bold text-white",
  
  // Gombok
  primaryButton: "bg-brand-orange text-white hover:bg-brand-orange/90 font-semibold rounded-full px-6",
  iconAddBtn: "h-8 w-8 rounded-full bg-brand-orange text-white hover:bg-brand-orange/90 p-0 flex items-center justify-center shrink-0",
  iconDeleteBtn: "h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-0 flex items-center justify-center transition-colors shrink-0",
  
  // Form Beviteli mezők (Input, Select, Textarea)
  inputWrapper: "bg-card-bg border border-white/10 rounded-xl",
  input: "bg-transparent border-none text-white placeholder:text-white/40 focus-visible:ring-1 focus-visible:ring-white/20 rounded-xl",
  label: "text-sm text-muted-foreground font-medium mb-1.5",
  
  // Szekciók és kártyák
  sectionContent: "p-4 space-y-4 rounded-2xl bg-card-bg border border-white/5 relative",
  sectionHeader: "flex items-center justify-between mt-8 mb-4",
  sectionTitle: "text-base font-semibold text-white",
  
  // Tabs
  tabsList: "bg-transparent border-b border-white/10 p-0 w-full flex space-x-6",
  tabsTrigger: "data-[state=active]:border-b-2 data-[state=active]:border-brand-orange data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white rounded-none text-white/60 transition-all px-2 py-2 mb-[-1px]",
  
  // Switch
  switch: "data-[state=checked]:bg-brand-orange",
  
  // Checkbox (nincs szegély, fix hátérszín narancs, bepipálva fehér)
  checkbox: "bg-brand-orange border-none text-white data-[state=checked]:text-brand-orange",
  checkboxItem: "flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-white/5 p-3 bg-card-bg cursor-pointer hover:bg-white/10 transition-colors",

  // Média sorok
  mediaRow: "flex items-center justify-between bg-admin-bg border border-white/5 p-3 rounded-xl shadow-sm text-sm"
};
