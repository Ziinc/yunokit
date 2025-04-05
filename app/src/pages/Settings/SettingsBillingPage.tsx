import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Package } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  current: boolean;
}

interface BillingInfo {
  plan: string;
  status: "active" | "inactive";
  nextBillingDate: string;
  cardLast4: string;
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
            features: ["1 workspace", "Basic features", "Community support"],
            current: false
          },
          {
            id: "2",
            name: "Pro",
            price: 10,
            features: ["Unlimited workspaces", "Advanced features", "Priority support", "API access"],
            current: true
          },
          {
            id: "3",
            name: "Enterprise",
            price: 49,
            features: ["Custom features", "Dedicated support", "SLA", "SSO", "Advanced security"],
            current: false
          }
        ];

        const mockBillingInfo = {
          plan: "Pro",
          status: "active" as const,
          nextBillingDate: "2024-04-01",
          cardLast4: "4242"
        };

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
                  <div className="p-4 border rounded-lg space-y-2">
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
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  </div>
                </div>
              )}

              {/* Available Plans */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Available Plans</h3>
                <div className="grid gap-4 md:grid-cols-3">
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
                              {feature}
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