"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Search, 
  Plus, 
  Filter,
  TrendingUp,
  Clock,
  Star,
  Tag,
  MapPin
} from "lucide-react";

// Types for community features
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
  };
  attendees: number;
  isAttending?: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  avatar: string;
  isJoined?: boolean;
}

// Update the profile type to include avatar
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  user_type: "farmer" | "buyer" | "admin";
  created_at: string;
  updated_at: string;
  avatar?: string; // Add optional avatar property
};

export default function CommunityPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("forums");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });
  const [showNewPostForm, setShowNewPostForm] = useState(false);

  // Mock data for posts
  useEffect(() => {
    // In a real app, this would fetch from an API
    setPosts([
      {
        id: "1",
        title: "Best practices for organic farming",
        content: "I've been practicing organic farming for 5 years now. Here are some tips I've learned along the way...",
        author: {
          id: "user1",
          name: "John Smith",
          avatar: "/avatars/john.jpg",
        },
        category: "organic-farming",
        tags: ["organic", "sustainable", "tips"],
        likes: 24,
        comments: 8,
        createdAt: "2023-04-01T10:30:00Z",
        isLiked: false,
        isBookmarked: false,
      },
      {
        id: "2",
        title: "Dealing with pest control naturally",
        content: "Has anyone tried using companion planting to deter pests? I'm looking for natural alternatives to pesticides...",
        author: {
          id: "user2",
          name: "Maria Garcia",
          avatar: "/avatars/maria.jpg",
        },
        category: "pest-control",
        tags: ["pests", "natural", "companion-planting"],
        likes: 18,
        comments: 12,
        createdAt: "2023-04-02T14:45:00Z",
        isLiked: true,
        isBookmarked: false,
      },
      {
        id: "3",
        title: "New irrigation system recommendations",
        content: "I'm planning to upgrade my irrigation system this season. Any recommendations for efficient drip irrigation systems?",
        author: {
          id: "user3",
          name: "David Chen",
          avatar: "/avatars/david.jpg",
        },
        category: "irrigation",
        tags: ["irrigation", "equipment", "water-conservation"],
        likes: 15,
        comments: 6,
        createdAt: "2023-04-03T09:15:00Z",
        isLiked: false,
        isBookmarked: true,
      },
    ]);

    // Mock data for events
    setEvents([
      {
        id: "1",
        title: "Spring Planting Workshop",
        description: "Learn the best techniques for spring planting and crop rotation strategies.",
        date: "2023-04-15T09:00:00Z",
        location: "Community Farm Center, Springfield",
        organizer: {
          id: "org1",
          name: "Local Farmers Association",
          avatar: "/avatars/lfa.jpg",
        },
        attendees: 42,
        isAttending: true,
      },
      {
        id: "2",
        title: "Sustainable Agriculture Conference",
        description: "Annual conference on sustainable farming practices and innovations.",
        date: "2023-05-20T10:00:00Z",
        location: "Agricultural University, Greenfield",
        organizer: {
          id: "org2",
          name: "Sustainable Farming Institute",
          avatar: "/avatars/sfi.jpg",
        },
        attendees: 128,
        isAttending: false,
      },
      {
        id: "3",
        title: "Farm-to-Table Networking Event",
        description: "Connect with local restaurants and food businesses interested in sourcing directly from farmers.",
        date: "2023-04-25T18:00:00Z",
        location: "Downtown Market Hall, Springfield",
        organizer: {
          id: "org3",
          name: "Local Food Alliance",
          avatar: "/avatars/lfa.jpg",
        },
        attendees: 56,
        isAttending: true,
      },
    ]);

    // Mock data for groups
    setGroups([
      {
        id: "1",
        name: "Organic Farmers Network",
        description: "A community of farmers practicing and learning about organic farming methods.",
        members: 342,
        category: "organic-farming",
        avatar: "/groups/organic.jpg",
        isJoined: true,
      },
      {
        id: "2",
        name: "Small Farm Equipment Exchange",
        description: "Buy, sell, and trade farming equipment with other local farmers.",
        members: 187,
        category: "equipment",
        avatar: "/groups/equipment.jpg",
        isJoined: false,
      },
      {
        id: "3",
        name: "Seasonal Crop Planning",
        description: "Share crop planning strategies and seasonal planting guides.",
        members: 256,
        category: "planning",
        avatar: "/groups/planning.jpg",
        isJoined: true,
      },
    ]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would filter the content based on the search query
    toast.info(`Searching for: ${searchQuery}`);
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
      }
      return post;
    }));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isBookmarked: !post.isBookmarked,
        };
      }
      return post;
    }));
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1,
          isAttending: !event.isAttending,
        };
      }
      return event;
    }));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          members: group.isJoined ? group.members - 1 : group.members + 1,
          isJoined: !group.isJoined,
        };
      }
      return group;
    }));
  };

  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost({
      ...newPost,
      [name]: value,
    });
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // In a real app, this would submit to an API
    setTimeout(() => {
      const newPostObj: Post = {
        id: (posts.length + 1).toString(),
        title: newPost.title,
        content: newPost.content,
        author: {
          id: user?.id || "user1",
          name: profile?.full_name || "Anonymous",
          avatar: (profile as UserProfile)?.avatar || "/avatars/default.jpg",
        },
        category: newPost.category,
        tags: newPost.tags.split(",").map(tag => tag.trim()),
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
        isBookmarked: false,
      };
      
      setPosts([newPostObj, ...posts]);
      setNewPost({
        title: "",
        content: "",
        category: "general",
        tags: "",
      });
      setShowNewPostForm(false);
      setIsLoading(false);
      toast.success("Post created successfully!");
    }, 1000);
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time to a readable string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Redirect if not logged in
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Community</h1>
            <Button onClick={() => setShowNewPostForm(!showNewPostForm)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search discussions, events, or groups..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                Search
              </Button>
            </div>
          </form>

          {/* New Post Form */}
          {showNewPostForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Create a New Post</CardTitle>
                <CardDescription>
                  Share your knowledge, ask questions, or start a discussion with the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="text-sm font-medium">
                        Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Give your post a title"
                        value={newPost.title}
                        onChange={handleNewPostChange}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="content" className="text-sm font-medium">
                        Content
                      </label>
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Write your post content here..."
                        value={newPost.content}
                        onChange={handleNewPostChange}
                        rows={5}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="text-sm font-medium">
                          Category
                        </label>
                        <select
                          id="category"
                          name="category"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={newPost.category}
                          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="organic-farming">Organic Farming</option>
                          <option value="pest-control">Pest Control</option>
                          <option value="irrigation">Irrigation</option>
                          <option value="equipment">Equipment</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="tags" className="text-sm font-medium">
                          Tags (comma separated)
                        </label>
                        <Input
                          id="tags"
                          name="tags"
                          placeholder="e.g., organic, sustainable, tips"
                          value={newPost.tags}
                          onChange={handleNewPostChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewPostForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="forums" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Forums
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Groups
              </TabsTrigger>
            </TabsList>

            {/* Forums Tab */}
            <TabsContent value="forums">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Discussion Forums</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarImage src={post.author.avatar} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <CardDescription>
                              Posted by {post.author.name} on {formatDate(post.createdAt)}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">{post.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">
                        {post.content.length > 200
                          ? `${post.content.substring(0, 200)}...`
                          : post.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={post.isLiked ? "text-green-600" : ""}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={post.isBookmarked ? "text-yellow-500" : ""}
                        onClick={() => handleBookmarkPost(post.id)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Upcoming Events</h2>
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>

              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <CardDescription>
                            Organized by {event.organizer.name}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={event.isAttending ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleJoinEvent(event.id)}
                        >
                          {event.isAttending ? "Attending" : "Join"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{event.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {formatDate(event.date)} at {formatTime(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{event.attendees} attending</span>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Farmers Groups</h2>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>

              <div className="space-y-4">
                {groups.map((group) => (
                  <Card key={group.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={group.avatar} alt={group.name} />
                            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <CardDescription>
                              {group.members} members • {group.category}
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant={group.isJoined ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          {group.isJoined ? "Leave" : "Join"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{group.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Discussions
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          Events
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          {/* User Profile Card */}
          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={(profile as UserProfile)?.avatar || "/avatars/default.jpg"} alt="Profile" />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{profile?.full_name || "User"}</CardTitle>
              <CardDescription>Farmer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="font-semibold">12</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div>
                  <div className="font-semibold">5</div>
                  <div className="text-sm text-gray-500">Events</div>
                </div>
                <div>
                  <div className="font-semibold">3</div>
                  <div className="text-sm text-gray-500">Groups</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Organic Certification</span>
                  </div>
                  <Badge variant="secondary">24 posts</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Water Conservation</span>
                  </div>
                  <Badge variant="secondary">18 posts</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Farm-to-Table</span>
                  </div>
                  <Badge variant="secondary">15 posts</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Sustainable Practices</span>
                  </div>
                  <Badge variant="secondary">12 posts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Spring Planting Workshop</div>
                    <div className="text-sm text-gray-500">Apr 15, 9:00 AM</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Farm-to-Table Networking</div>
                    <div className="text-sm text-gray-500">Apr 25, 6:00 PM</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Sustainable Agriculture Conference</div>
                    <div className="text-sm text-gray-500">May 20, 10:00 AM</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Events
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
