import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    preferred_currency: "CAD",
    dashboard_income_color: "hsl(142, 76%, 36%)",
    dashboard_expense_color: "hsl(0, 84%, 60%)",
    primary_color: "",
    secondary_color: "",
    accent_color: "",
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          preferred_currency: data.preferred_currency || "CAD",
          dashboard_income_color: data.dashboard_income_color || "hsl(142, 76%, 36%)",
          dashboard_expense_color: data.dashboard_expense_color || "hsl(0, 84%, 60%)",
          primary_color: data.primary_color || "",
          secondary_color: data.secondary_color || "",
          accent_color: data.accent_color || "",
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update(settings)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your personal information and customize your experience</p>
      </div>

      {/* Personal Information */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Personal Information</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={settings.first_name}
                onChange={(e) => setSettings({ ...settings, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={settings.last_name}
                onChange={(e) => setSettings({ ...settings, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={settings.phone_number}
              onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </Card>

      {/* Dashboard Settings */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Dashboard Preferences</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select value={settings.preferred_currency} onValueChange={(value) => setSettings({ ...settings, preferred_currency: value })}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="income_color">Income Chart Color</Label>
              <Input
                id="income_color"
                type="color"
                value={settings.dashboard_income_color.match(/hsl\((\d+)/)?.[0]?.replace('hsl(', '#') || "#22c55e"}
                onChange={(e) => setSettings({ ...settings, dashboard_income_color: `hsl(${e.target.value})` })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">Color for income bars on charts</p>
            </div>
            <div>
              <Label htmlFor="expense_color">Expense Chart Color</Label>
              <Input
                id="expense_color"
                type="color"
                value={settings.dashboard_expense_color.match(/hsl\((\d+)/)?.[0]?.replace('hsl(', '#') || "#ef4444"}
                onChange={(e) => setSettings({ ...settings, dashboard_expense_color: `hsl(${e.target.value})` })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">Color for expense bars on charts</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Customization */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold mb-4 text-foreground">App Theme</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <Input
                id="primary_color"
                type="color"
                value={settings.primary_color || "#3b82f6"}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">Main brand color</p>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <Input
                id="secondary_color"
                type="color"
                value={settings.secondary_color || "#8b5cf6"}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">Secondary brand color</p>
            </div>
            <div>
              <Label htmlFor="accent_color">Accent Color</Label>
              <Input
                id="accent_color"
                type="color"
                value={settings.accent_color || "#ec4899"}
                onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground mt-1">Accent highlights</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Note: Theme colors will be applied after saving and refreshing the page.
          </p>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
