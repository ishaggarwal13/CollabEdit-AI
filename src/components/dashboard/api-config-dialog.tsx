"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, PlusCircle } from "lucide-react";
import type { ApiProvider } from "@/lib/api-providers";
import { useState, useEffect } from "react";
import { useApiProviders } from "@/hooks/use-api-providers";
import { fetchData } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const emptyProvider: Omit<ApiProvider, "id"> = {
  name: "",
  enabled: true,
  baseUrl: "",
  apiKey: "",
  endpoints: [
    { name: "quote", path: "" },
    { name: "search", path: "" },
    { name: "intraday", path: "" },
    { name: "daily", path: "" },
  ],
};

interface ApiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ApiConfigDialog({
  open,
  onOpenChange,
}: ApiConfigDialogProps) {
  const { providers, setProviders } = useApiProviders();
  const [localProviders, setLocalProviders] = useState<ApiProvider[]>([]);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [newProviderId, setNewProviderId] = useState("");
  const [newProvider, setNewProvider] = useState(emptyProvider);
  const { toast } = useToast();
  const [testingProviderId, setTestingProviderId] = useState<string | null>(
    null
  );
  const [testedProviders, setTestedProviders] = useState<
    Record<string, { apiKey: string; success: boolean }>
  >({});

  useEffect(() => {
    if (open) {
      setLocalProviders(JSON.parse(JSON.stringify(providers)));
      setIsAddingProvider(false);
      setTestedProviders({});
    }
  }, [open, providers]);

  const handleProviderChange = (
    id: string,
    key: keyof ApiProvider,
    value: any
  ) => {
    setLocalProviders(
      localProviders.map((p) => (p.id === id ? { ...p, [key]: value } : p))
    );
    if (key === "apiKey") {
      setTestedProviders((prev) => ({
        ...prev,
        [id]: { apiKey: value, success: false },
      }));
    }
  };

  const handleEndpointChange = (
    providerId: string,
    endpointName: string,
    newPath: string
  ) => {
    setLocalProviders(
      localProviders.map((p) => {
        if (p.id === providerId) {
          return {
            ...p,
            endpoints: p.endpoints.map((e) =>
              e.name === endpointName ? { ...e, path: newPath } : e
            ),
          };
        }
        return p;
      })
    );
  };

  const handleAddNewProvider = () => {
    if (!newProviderId || !newProvider.name || !newProvider.baseUrl) {
      alert("Please fill out all required fields.");
      return;
    }
    const newProviderWithId: ApiProvider = {
      id: newProviderId.toLowerCase().replace(/\s+/g, "-"),
      ...newProvider,
    };
    setLocalProviders([...localProviders, newProviderWithId]);
    setIsAddingProvider(false);
    setNewProvider(emptyProvider);
    setNewProviderId("");
  };

  const handleRemoveProvider = (id: string) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      setLocalProviders(localProviders.filter((p) => p.id !== id));
    }
  };

  const handleTestProvider = async (provider: ApiProvider) => {
    setTestingProviderId(provider.id);
    const result = await fetchData({
      provider,
      endpointName: "quote",
      params: { symbol: "IBM" }, // Use a common stock for testing
    });
    setTestingProviderId(null);

    if (result.error) {
      toast({
        title: "Test Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Test Successful!",
        description: `Successfully fetched data from ${provider.name}.`,
        variant: "default",
      });
      setTestedProviders((prev) => ({
        ...prev,
        [provider.id]: { apiKey: provider.apiKey, success: true },
      }));
    }
  };

  const handleSaveChanges = () => {
    // Require successful test for any provider whose apiKey changed
    const untested = localProviders.filter((lp) => {
      const original = providers.find((p) => p.id === lp.id);
      if (!original) return false;
      const apiKeyChanged = lp.apiKey !== original.apiKey;
      if (!apiKeyChanged) return false;
      const tested = testedProviders[lp.id];
      return !(tested && tested.success && tested.apiKey === lp.apiKey);
    });

    if (untested.length > 0) {
      toast({
        title: "Please test changed API keys",
        description: "Test providers with modified API keys before saving.",
        variant: "destructive",
      });
      return;
    }

    // Prevent disabling default providers and enforce enabled state
    const updated = localProviders.map((p) => {
      const isDefault = ["alpha-vantage", "finnhub"].includes(p.id);
      return isDefault ? { ...p, enabled: true } : p;
    });

    setProviders(updated);
    onOpenChange(false);
    window.location.reload();
  };

  const handleCancelAdd = () => {
    setIsAddingProvider(false);
    setNewProvider(emptyProvider);
    setNewProviderId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {isAddingProvider ? "Add Custom Provider" : "API Configuration"}
          </DialogTitle>
          <DialogDescription>
            {isAddingProvider
              ? "Define a new custom API provider."
              : "Configure your API providers to fetch financial data."}
          </DialogDescription>
        </DialogHeader>

        {isAddingProvider ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="provider-id">Provider ID *</Label>
              <Input
                id="provider-id"
                placeholder="my-custom-api"
                value={newProviderId}
                onChange={(e) => setNewProviderId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="provider-name">Provider Name *</Label>
              <Input
                id="provider-name"
                placeholder="My Custom API"
                value={newProvider.name}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="provider-base-url">Base URL *</Label>
              <Input
                id="provider-base-url"
                placeholder="https://api.example.com"
                value={newProvider.baseUrl}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, baseUrl: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="provider-api-key">API Key</Label>
              <Input
                id="provider-api-key"
                placeholder="Optional API key"
                value={newProvider.apiKey}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, apiKey: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={handleCancelAdd}>
                Cancel
              </Button>
              <Button onClick={handleAddNewProvider}>Add Provider</Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[60vh] p-1 pr-4">
              <Accordion
                type="multiple"
                defaultValue={localProviders
                  .filter((p) => p.enabled)
                  .map((p) => p.id)}
              >
                {localProviders.map((provider) => (
                  <AccordionItem key={provider.id} value={provider.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-4 w-full">
                        <span>{provider.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            provider.enabled
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {provider.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`enabled-${provider.id}`}
                            checked={provider.enabled}
                            onCheckedChange={(checked) =>
                              handleProviderChange(
                                provider.id,
                                "enabled",
                                checked
                              )
                            }
                            disabled={["alpha-vantage", "finnhub"].includes(
                              provider.id
                            )}
                          />
                          <Label htmlFor={`enabled-${provider.id}`}>
                            Enable Provider
                            {["alpha-vantage", "finnhub"].includes(provider.id)
                              ? " (locked)"
                              : ""}
                          </Label>
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestProvider(provider)}
                            disabled={
                              testingProviderId === provider.id ||
                              !provider.apiKey ||
                              !provider.enabled
                            }
                          >
                            {testingProviderId === provider.id
                              ? "Testing..."
                              : "Test"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveProvider(provider.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`name-${provider.id}`}>
                          Provider Name
                        </Label>
                        <Input
                          id={`name-${provider.id}`}
                          value={provider.name}
                          onChange={(e) =>
                            handleProviderChange(
                              provider.id,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`base-url-${provider.id}`}>
                          Base URL
                        </Label>
                        <Input
                          id={`base-url-${provider.id}`}
                          value={provider.baseUrl}
                          onChange={(e) =>
                            handleProviderChange(
                              provider.id,
                              "baseUrl",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`api-key-${provider.id}`}>
                          API Key
                        </Label>
                        <Input
                          id={`api-key-${provider.id}`}
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) =>
                            handleProviderChange(
                              provider.id,
                              "apiKey",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">
                          Available Endpoints
                        </h4>
                        <div className="space-y-2">
                          {provider.endpoints.map((endpoint) => (
                            <div
                              key={endpoint.name}
                              className="grid grid-cols-3 gap-2 items-center"
                            >
                              <Label
                                htmlFor={`endpoint-${provider.id}-${endpoint.name}`}
                                className="text-right pr-2 capitalize"
                              >
                                {endpoint.name}:
                              </Label>
                              <Input
                                id={`endpoint-${provider.id}-${endpoint.name}`}
                                className="col-span-2"
                                value={endpoint.path}
                                onChange={(e) =>
                                  handleEndpointChange(
                                    provider.id,
                                    endpoint.name,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => setIsAddingProvider(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add New Provider
              </Button>
            </ScrollArea>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
