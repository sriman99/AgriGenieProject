'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CreditCard, Wallet, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethod {
  id: string;
  type: string;
  details: {
    card_number?: string;
    expiry?: string;
    upi_id?: string;
    account_number?: string;
    bank_name?: string;
  };
  is_default: boolean;
}

export function PaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod>>({
    type: 'card',
    details: {},
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/profile/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setMethods(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment methods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const response = await fetch('/api/profile/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMethod),
      });

      if (!response.ok) throw new Error('Failed to add payment method');

      toast({
        title: "Success",
        description: "Payment method added successfully.",
      });

      // Reset form and refresh methods
      setNewMethod({ type: 'card', details: {} });
      fetchPaymentMethods();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/profile/payment-methods/${methodId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete payment method');

      toast({
        title: "Success",
        description: "Payment method deleted successfully.",
      });

      fetchPaymentMethods();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(`/api/profile/payment-methods/${methodId}/default`, {
        method: 'PUT',
      });

      if (!response.ok) throw new Error('Failed to set default payment method');

      toast({
        title: "Success",
        description: "Default payment method updated successfully.",
      });

      fetchPaymentMethods();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set default payment method. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods for purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {method.type === 'card' && <CreditCard className="w-6 h-6" />}
                  {method.type === 'upi' && <Wallet className="w-6 h-6" />}
                  {method.type === 'bank' && <Building2 className="w-6 h-6" />}
                  <div>
                    <p className="font-medium">
                      {method.type === 'card' && 'Card ending in ' + method.details.card_number?.slice(-4)}
                      {method.type === 'upi' && 'UPI: ' + method.details.upi_id}
                      {method.type === 'bank' && method.details.bank_name}
                    </p>
                    {method.is_default && (
                      <span className="text-sm text-green-600">Default</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMethod(method.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Add Payment Method</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new payment method to your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMethod} className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <RadioGroup
                value={newMethod.type}
                onValueChange={(value) =>
                  setNewMethod((prev) => ({ ...prev, type: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank">Bank Account</Label>
                </div>
              </RadioGroup>
            </div>

            {newMethod.type === 'card' && (
              <>
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={newMethod.details.card_number || ''}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        details: { ...prev.details, card_number: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    placeholder="MM/YY"
                    value={newMethod.details.expiry || ''}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        details: { ...prev.details, expiry: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
              </>
            )}

            {newMethod.type === 'upi' && (
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input
                  placeholder="username@upi"
                  value={newMethod.details.upi_id || ''}
                  onChange={(e) =>
                    setNewMethod((prev) => ({
                      ...prev,
                      details: { ...prev.details, upi_id: e.target.value },
                    }))
                  }
                  required
                />
              </div>
            )}

            {newMethod.type === 'bank' && (
              <>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Bank Name"
                    value={newMethod.details.bank_name || ''}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        details: { ...prev.details, bank_name: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Account Number"
                    value={newMethod.details.account_number || ''}
                    onChange={(e) =>
                      setNewMethod((prev) => ({
                        ...prev,
                        details: { ...prev.details, account_number: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Payment Method"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 