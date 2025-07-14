import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Package, Plus, Minus, AlertTriangle, Receipt } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: (string | { text: string; highlight: boolean })[];
  addOns?: { name: string; price: number }[];
  current: boolean;
}

interface BillingInfo {
  plan: string;
  status: "active" | "inactive";
  nextBillingDate: string;
  cardLast4: string;
  addOns: {
    workspaces: { current: number; limit: number; price: number; maxUsage: number };
    members: { current: number; limit: number; price: number; maxUsage: number };
  };
}


const SettingsBillingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBillingData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        const mockPlans = [
          {
            id: "1",
            name: "Free",
            price: 0,
            features: [
              "1 user included per workspace",
              "1 workspace",
              "Basic content management",
              "Standard support",
              "Basic analytics"
            ],
            current: false
          },
          {
            id: "2",
            name: "Pro",
            price: 15,
            features: [
              { text: "3 users included per workspace", highlight: true },
              { text: "2 workspaces included", highlight: true },
              { text: "Community features", highlight: true },
              "System authors",
              "Content approval flow",
              "Priority support",
              "Advanced analytics"
            ],
            addOns: [
              { name: "Additional Workspace User", price: 5 },
              { name: "Additional Workspace", price: 10 }
            ],
            current: true
          }
        ];

        const mockBillingInfo = {
          plan: "Pro",
          status: "active" as const,
          nextBillingDate: "2024-04-01",
          cardLast4: "4242",
          addOns: {
            workspaces: { current: 3, limit: 2, price: 10, maxUsage: 4 },
            members: { current: 4, limit: 3, price: 5, maxUsage: 5 }
          }
        } satisfies BillingInfo;


        setPlans(mockPlans);
        setBillingInfo(mockBillingInfo);
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
        toast({
          title: "Error",
          description: "Failed to load billing information",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [toast]);

  const handleUpdatePlan = async (planId: string) => {
    try {
      setIsUpdating(true);

      // TODO: Replace with actual API call
      const newPlan = plans.find(p => p.id === planId);
      if (!newPlan) throw new Error("Invalid plan selected");

      setPlans(plans.map(p => ({ ...p, current: p.id === planId })));
      setBillingInfo(prev => prev ? { ...prev, plan: newPlan.name } : null);

      toast({
        title: "Plan updated",
        description: `Successfully switched to ${newPlan.name} plan`
      });
    } catch (error) {
      console.error("Update plan error:", error);
      toast({
        title: "Failed to update plan",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePayment = () => {
    // TODO: Implement Stripe or other payment gateway integration
    toast({
      title: "Coming soon",
      description: "Payment method update functionality will be available soon"
    });
  };

  return (
    <TabsContent value="billing" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Billing & Subscription</CardTitle>
          <CardDescription>
            Manage your subscription plan and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <>
              {/* Current Plan Info */}
              {billingInfo && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Current Plan</h3>
                  <div className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{billingInfo.plan} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          Next billing date: {billingInfo.nextBillingDate}
                        </p>
                      </div>
                      <span className="text-sm px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {billingInfo.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Add-ons Section */}
                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-sm font-medium">Add-ons</h4>
                      
                      {/* Workspaces */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Workspaces</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {billingInfo.addOns.workspaces.current} / {billingInfo.addOns.workspaces.limit} workspaces
                            </p>
                            <span className="text-xs text-orange-500">
                              (Max: {billingInfo.addOns.workspaces.maxUsage}
                              {billingInfo.addOns.workspaces.maxUsage > billingInfo.addOns.workspaces.current && 
                               " - billing based on this"})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement */}}
                            disabled={billingInfo.addOns.workspaces.current > billingInfo.addOns.workspaces.limit}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement */}}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Members */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">Members</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {billingInfo.addOns.members.current} / {billingInfo.addOns.members.limit} members
                            </p>
                            <span className="text-xs text-orange-500">
                              (Max: {billingInfo.addOns.members.maxUsage}
                              {billingInfo.addOns.members.maxUsage > billingInfo.addOns.members.current && 
                               " - billing based on this"})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement */}}
                            disabled={billingInfo.addOns.members.current > billingInfo.addOns.members.limit}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* TODO: Implement */}}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Warning Messages */}
                      {(billingInfo.addOns.workspaces.current > billingInfo.addOns.workspaces.limit ||
                        billingInfo.addOns.members.current > billingInfo.addOns.members.limit) && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            You are currently over your plan limits. Please remove excess workspaces or members before reducing your add-ons.
                          </AlertDescription>
                        </Alert>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Note: You are charged based on the maximum usage of each month.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t">
                      <CreditCard className="h-4 w-4" />
                      <span>Card ending in {billingInfo.cardLast4}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleUpdatePayment}
                      >
                        Update
                      </Button>
                    </div>

                    <div className="pt-3 border-t">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {/* TODO: Implement */}}
                      >
                        Unsubscribe
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Invoices */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Invoice History
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* TODO: Replace with actual invoice data */}
                    <TableRow>
                      <TableCell>March 1, 2024</TableCell>
                      <TableCell>Pro Plan + 1 Workspace + 2 Members</TableCell>
                      <TableCell>$35.00</TableCell>
                      <TableCell>
                        <span className="text-sm px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                          Paid
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Available Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {plans.map(plan => (
                    <Card key={plan.id} className={plan.current ? "border-primary" : ""}>
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          ${plan.price}/month
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-primary" />
                              {typeof feature === "string" ? feature : (
                                <span className={feature.highlight ? "font-bold" : ""}>
                                  {feature.text}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={plan.current ? "outline" : "default"}
                          disabled={plan.current || isUpdating}
                          onClick={() => handleUpdatePlan(plan.id)}
                        >
                          {plan.current ? "Current Plan" : "Switch Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsBillingPage; 