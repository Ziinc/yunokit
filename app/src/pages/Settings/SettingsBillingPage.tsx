import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Package, Receipt } from "lucide-react";

const SettingsBillingPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleComingSoon = () => {
    toast({
      title: "Coming soon",
      description: "Billing management will be available soon"
    });
  };

  return (
    <TabsContent value="billing" className="space-y-4 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="icon-md" />
            Billing & Subscription
          </CardTitle>
          <CardDescription>
            Manage your billing information, view invoices, and upgrade your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Package className="icon-sm" />
              Current Plan
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h4 className="text-lg font-semibold">Free Plan</h4>
                  <p className="text-muted-foreground">$0/month</p>
                  <p className="text-sm text-muted-foreground">
                    Basic features with limited usage
                  </p>
                  <Button onClick={handleComingSoon}>
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="icon-sm" />
              Payment Method
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">No payment method configured</p>
                  <Button onClick={handleComingSoon}>
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice History */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Receipt className="icon-sm" />
              Invoice History
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">No invoices available</p>
                  <p className="text-sm text-muted-foreground">
                    Invoice history will appear here once you have a paid plan
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsBillingPage; 
