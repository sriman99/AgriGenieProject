-- Create tables for AgriGenie

-- Enable RLS (Row Level Security)
alter default privileges in schema public grant all on tables to postgres, anon, authenticated;

-- Profiles table (extends default auth.users)
create table profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    full_name text,
    user_type text check (user_type in ('farmer', 'buyer', 'admin')) not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint username_length check (char_length(full_name) >= 3)
);

-- Crop listings table
create table crop_listings (
    id uuid default uuid_generate_v4() primary key,
    farmer_id uuid references profiles(id) not null,
    crop_name text not null,
    quantity decimal not null check (quantity > 0),
    price_per_unit decimal not null check (price_per_unit > 0),
    unit text not null,
    description text,
    available boolean default true,
    created_at timestamptz default now()
);

-- Orders table
create table orders (
    id uuid default uuid_generate_v4() primary key,
    buyer_id uuid references profiles(id) not null,
    crop_listing_id uuid references crop_listings(id) not null,
    quantity decimal not null check (quantity > 0),
    total_price decimal not null check (total_price > 0),
    status text check (status in ('pending', 'accepted', 'completed', 'cancelled')) not null default 'pending',
    created_at timestamptz default now()
);

-- Disease detections table
create table disease_detections (
    id uuid default uuid_generate_v4() primary key,
    farmer_id uuid references profiles(id) not null,
    crop_name text not null,
    image_url text not null,
    detection_result jsonb not null,
    created_at timestamptz default now()
);

-- Market prices table
create table market_prices (
    id uuid default uuid_generate_v4() primary key,
    crop_name text not null,
    price decimal not null check (price > 0),
    market_location text not null,
    date timestamptz default now()
);

-- AI insights table
create table ai_insights (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) not null,
    insight_type text check (insight_type in ('price_prediction', 'weather_alert', 'disease_alert')) not null,
    content jsonb not null,
    created_at timestamptz default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table crop_listings enable row level security;
alter table orders enable row level security;
alter table disease_detections enable row level security;
alter table market_prices enable row level security;
alter table ai_insights enable row level security;

-- RLS Policies

-- Profiles
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Users can insert their own profile" on profiles;
drop policy if exists "Enable insert for authenticated users only" on profiles;

-- Allow public read of profiles
create policy "Public profiles are viewable by everyone" 
on profiles for select 
using (true);

-- Allow profile creation during signup
create policy "Enable insert for registration" 
on profiles for insert 
with check (true);

-- Allow users to update their own profiles
create policy "Users can update own profile" 
on profiles for update 
using (auth.uid() = id);

-- Crop Listings
create policy "Crop listings are viewable by everyone" on crop_listings
    for select using (true);

create policy "Farmers can create their own listings" on crop_listings
    for insert with check (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

create policy "Farmers can update their own listings" on crop_listings
    for update using (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

-- Orders
create policy "Users can view their own orders" on orders
    for select using (
        auth.uid() = buyer_id or 
        exists (
            select 1 from crop_listings 
            where crop_listings.id = crop_listing_id 
            and crop_listings.farmer_id = auth.uid()
        )
    );

create policy "Buyers can create orders" on orders
    for insert with check (
        auth.uid() = buyer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'buyer')
    );

create policy "Users can update their own orders" on orders
    for update using (
        auth.uid() = buyer_id or 
        exists (
            select 1 from crop_listings 
            where crop_listings.id = crop_listing_id 
            and crop_listings.farmer_id = auth.uid()
        )
    );

-- Disease Detections
create policy "Users can view their own disease detections" on disease_detections
    for select using (auth.uid() = farmer_id);

create policy "Farmers can create disease detections" on disease_detections
    for insert with check (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

-- Market Prices
create policy "Market prices are viewable by everyone" on market_prices
    for select using (true);

-- AI Insights
create policy "Users can view their own insights" on ai_insights
    for select using (auth.uid() = user_id);

create policy "System can create insights for users" on ai_insights
    for insert with check (true);