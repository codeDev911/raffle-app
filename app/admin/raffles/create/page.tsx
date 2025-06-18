"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";

// Calculation
export function roundUpTwoDecimals(num: any) {
  return Math.ceil(num * 100) / 100;
}

export default function CreateRafflePage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    longDescription: "",
    image: "",
    gallery: [] as string[],
    price: "",
    realPrice: "",
    totalEntries: "",
    category: "",
    featured: false,
    endDate: "",
    specifications: [] as string[],
    rules: [] as string[],
  });
  const [newSpec, setNewSpec] = useState("");
  const [newRule, setNewRule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number.parseInt(formData.price),
          realPrice: Number.parseInt(formData.realPrice),
          totalEntries: Number.parseInt(formData.totalEntries),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin/raffles");
      } else {
        setError(data.error || "Failed to create raffle");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addSpecification = () => {
    if (newSpec.trim()) {
      setFormData({
        ...formData,
        specifications: [...formData.specifications, newSpec.trim()],
      });
      setNewSpec("");
    }
  };

  const removeSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  const addRule = () => {
    if (newRule.trim()) {
      setFormData({
        ...formData,
        rules: [...formData.rules, newRule.trim()],
      });
      setNewRule("");
    }
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button asChild variant="ghost" className="rounded-2xl">
          <Link href="/admin/raffles">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Raffles
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Raffle
          </h1>
          <p className="text-gray-600 mt-2">
            Add a new raffle item to your platform
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of your raffle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="iPhone 15 Pro Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Vehicles">Vehicles</SelectItem>
                    <SelectItem value="Jewelry">Jewelry</SelectItem>
                    <SelectItem value="Gaming">Gaming</SelectItem>
                    <SelectItem value="Cash">Cash Prizes</SelectItem>
                    <SelectItem value="Home">Home & Garden</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="rounded-2xl"
                placeholder="Latest iPhone with 256GB storage"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={formData.longDescription}
                onChange={(e) =>
                  setFormData({ ...formData, longDescription: e.target.value })
                }
                className="rounded-2xl min-h-[120px]"
                placeholder="Detailed description of the prize..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Main Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="rounded-2xl"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Entries */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Pricing & Entries</CardTitle>
            <CardDescription>
              Set the price per entry and total number of entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="real_price">Real Price (PKR) *</Label>
                <Input
                  id="real_price"
                  type="number"
                  value={formData.realPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, realPrice: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price per Entry (PKR) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="50"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalEntries">Total Entries *</Label>
                <Input
                  id="totalEntries"
                  type="number"
                  value={formData.totalEntries}
                  onChange={(e) =>
                    setFormData({ ...formData, totalEntries: e.target.value })
                  }
                  className="rounded-2xl"
                  placeholder="1000"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="rounded-2xl"
                  required
                />
              </div>
              <div className="md:col-span-2 p-4 space-y-1 rounded-2xl bg-gray-100">
                <Label htmlFor="" className="text-base font-bold">
                  Revenue calculated
                </Label>
                <p className="text-gray-800 text-sm">
                  Total Aprox :{" "}
                  <span>
                    Rs.{" "}
                    {Number.parseInt(formData.price) *
                      Number.parseInt(formData.totalEntries) || 0}
                  </span>
                </p>
                <p className="text-gray-800 text-sm">
                  Earning %age :{" "}
                  <span
                    className={
                      roundUpTwoDecimals(
                        ((Number.parseInt(formData.price) *
                          Number.parseInt(formData.totalEntries)) /
                          Number.parseInt(formData.realPrice)) *
                          100
                      ) -
                        100 <
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {roundUpTwoDecimals(
                      ((Number.parseInt(formData.price) *
                        Number.parseInt(formData.totalEntries)) /
                        Number.parseInt(formData.realPrice)) *
                        100
                    ) - 100 || 0}
                    %
                  </span>
                </p>
                <p className="text-gray-800 text-sm">
                  Total Profit : Rs.{" "}
                  <span
                    className={
                      Number.parseInt(formData.price) *
                        Number.parseInt(formData.totalEntries) -
                        Number.parseInt(formData.realPrice) <
                      0
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {Number.parseInt(formData.price) *
                      Number.parseInt(formData.totalEntries) -
                      Number.parseInt(formData.realPrice) || 0}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured">Featured Raffle</Label>
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>
              Add technical specifications or features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newSpec}
                onChange={(e) => setNewSpec(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a specification..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSpecification())
                }
              />
              <Button
                type="button"
                onClick={addSpecification}
                className="rounded-2xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specifications.map((spec, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Rules & Terms</CardTitle>
            <CardDescription>
              Add specific rules for this raffle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                className="rounded-2xl"
                placeholder="Add a rule..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addRule())
                }
              />
              <Button type="button" onClick={addRule} className="rounded-2xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.rules.map((rule, index) => (
                <Badge key={index} variant="secondary" className="rounded-2xl">
                  {rule}
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            asChild
            className="rounded-2xl"
          >
            <Link href="/admin/raffles">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white rounded-2xl"
          >
            {loading ? "Creating..." : "Create Raffle"}
          </Button>
        </div>
      </form>
    </div>
  );
}
