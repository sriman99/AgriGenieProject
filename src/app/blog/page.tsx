"use client";

import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import Image from "next/image";
import { Calendar, Clock, User, Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Dummy blog data
const initialBlogPosts = [
  {
    id: 1,
    title: "Maximizing Crop Yield with AI-Powered Irrigation Systems",
    excerpt:
      "Learn how artificial intelligence is revolutionizing irrigation management and helping farmers save water while improving crop yields.",
    content:
      "Artificial intelligence is transforming the way we approach irrigation in agriculture. Smart irrigation systems can now analyze soil moisture, weather patterns, and crop requirements in real-time to optimize water usage. This technology has shown to improve crop yields by up to 30% while reducing water consumption by 25%.",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3",
    author: "Dr. Sarah Johnson",
    date: "2024-02-20",
    readTime: "5 min read",
    category: "Technology",
  },
  {
    id: 2,
    title: "Sustainable Farming Practices for Better Soil Health",
    excerpt:
      "Discover the latest techniques in sustainable farming that can help improve soil quality and promote long-term agricultural success.",
    content:
      "Maintaining soil health is crucial for sustainable agriculture. This article explores various techniques such as crop rotation, cover cropping, and minimal tillage that can significantly improve soil quality. We'll also discuss how these practices can lead to better yields and reduced dependency on chemical fertilizers.",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399",
    author: "Michael Chen",
    date: "2024-02-18",
    readTime: "4 min read",
    category: "Sustainability",
  },
  {
    id: 3,
    title: "Understanding Climate-Smart Agriculture",
    excerpt:
      "An in-depth look at how farmers can adapt to changing climate conditions while maintaining productive and sustainable operations.",
    content:
      "Climate-smart agriculture (CSA) is an integrated approach to managing landscapes that addresses the interlinked challenges of food security and climate change. This article discusses practical strategies for implementing CSA in your farming operations.",
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2",
    author: "Emma Williams",
    date: "2024-02-15",
    readTime: "6 min read",
    category: "Climate",
  },
  {
    id: 4,
    title: "Market Trends: What Crops to Plant in 2024",
    excerpt:
      "Analysis of current market trends and predictions for the most profitable crops to grow in the coming season.",
    content:
      "Understanding market trends is crucial for maximizing farm profitability. This comprehensive analysis looks at projected demand, price trends, and climate considerations to help you make informed decisions about crop selection for the upcoming season.",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d",
    author: "Alex Thompson",
    date: "2024-02-12",
    readTime: "7 min read",
    category: "Market Analysis",
  },
  {
    id: 5,
    title: "Innovation in Pest Management",
    excerpt:
      "Exploring new technologies and methods for effective pest control in modern farming.",
    content:
      "Modern pest management combines traditional wisdom with cutting-edge technology. From AI-powered pest detection to biological control methods, this article covers the latest innovations helping farmers protect their crops while minimizing environmental impact.",
    image:
      "https://plus.unsplash.com/premium_photo-1664303936558-0c86d8ed436a?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    author: "Dr. Robert Lee",
    date: "2024-02-10",
    readTime: "5 min read",
    category: "Innovation",
  },
  {
    id: 6,
    title: "The Future of Vertical Farming",
    excerpt:
      "How vertical farming is revolutionizing urban agriculture and creating new opportunities.",
    content:
      "Vertical farming is emerging as a solution to urban food security challenges. This article explores the technology behind successful vertical farms, their benefits, and how they might shape the future of agriculture in urban environments.",
    image:
      "https://images.unsplash.com/photo-1600594825616-691df71fc515?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    author: "Lisa Martinez",
    date: "2024-02-08",
    readTime: "6 min read",
    category: "Future Tech",
  },
];

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newBlog, setNewBlog] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
  });

  const handleCreateBlog = () => {
    const newPost = {
      id: blogPosts.length + 1,
      ...newBlog,
      author: "Guest Author",
      date: new Date().toISOString().split("T")[0],
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2", // default image
    };
    setBlogPosts([...blogPosts, newPost]);
    setNewBlog({ title: "", excerpt: "", content: "", category: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AgriGenie Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Stay updated with the latest insights, tips, and trends in smart
            farming and agricultural technology.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="w-4 h-4 mr-2" />
                  <span className="mr-4">{post.author}</span>
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="mr-4">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{post.readTime}</span>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => setSelectedPost(post)}
                    >
                      Read More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{post.title}</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="relative h-64 mb-4">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <User className="w-4 h-4 mr-2" />
                        <span className="mr-4">{post.author}</span>
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-600 whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </article>
          ))}
        </div>

        {/* Create Blog Button and Modal */}
        <div className="mt-8 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Blog Title"
                  value={newBlog.title}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, title: e.target.value })
                  }
                />
                <Input
                  placeholder="Category"
                  value={newBlog.category}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, category: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Blog Excerpt"
                  value={newBlog.excerpt}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, excerpt: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Blog Content"
                  value={newBlog.content}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, content: e.target.value })
                  }
                  className="min-h-[200px]"
                />
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleCreateBlog}
                >
                  Publish Blog
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
