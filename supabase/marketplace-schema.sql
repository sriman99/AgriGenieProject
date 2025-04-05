-- Marketplace tables for enhanced e-commerce functionality

-- Create new marketplace listings table
create table marketplace_listings (
    id uuid default uuid_generate_v4() primary key,
    farmer_id uuid references profiles(id) not null,
    farmer_name text not null,
    crop_name text not null,
    description text not null,
    price decimal not null check (price > 0),
    quantity decimal not null check (quantity >= 0),
    unit text not null,
    category text not null,
    image_url text,
    location text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    is_organic boolean default false,
    harvest_date date,
    quality text,
    status text check (status in ('active', 'sold', 'reserved')) not null default 'active'
);

-- Create shopping cart items table (if needed for persistence)
create table cart_items (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) not null,
    listing_id uuid references marketplace_listings(id) not null,
    quantity integer not null check (quantity > 0),
    added_at timestamptz default now()
);

-- Create wishlist items table
create table wishlist_items (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) not null,
    listing_id uuid references marketplace_listings(id) not null,
    added_at timestamptz default now()
);

-- Create enhanced orders table
create table marketplace_orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) not null,
    farmer_id uuid references profiles(id) not null,
    total_amount decimal not null check (total_amount > 0),
    status text check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')) not null default 'pending',
    shipping_address jsonb not null,
    payment_method text not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create order items table for items within an order
create table order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references marketplace_orders(id) not null,
    listing_id uuid references marketplace_listings(id) not null,
    crop_name text not null,
    price decimal not null check (price > 0),
    quantity decimal not null check (quantity > 0),
    unit text not null,
    total_price decimal not null check (total_price > 0)
);

-- Enable Row Level Security
alter table marketplace_listings enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table marketplace_orders enable row level security;
alter table order_items enable row level security;

-- RLS Policies

-- Marketplace Listings
create policy "Marketplace listings are viewable by everyone" on marketplace_listings
    for select using (true);

create policy "Farmers can create their own listings" on marketplace_listings
    for insert with check (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

create policy "Farmers can update their own listings" on marketplace_listings
    for update using (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

create policy "Farmers can delete their own listings" on marketplace_listings
    for delete using (
        auth.uid() = farmer_id and 
        exists (select 1 from profiles where id = auth.uid() and user_type = 'farmer')
    );

-- Cart Items
create policy "Users can view their own cart items" on cart_items
    for select using (auth.uid() = user_id);

create policy "Users can insert their own cart items" on cart_items
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own cart items" on cart_items
    for update using (auth.uid() = user_id);

create policy "Users can delete their own cart items" on cart_items
    for delete using (auth.uid() = user_id);

-- Wishlist Items
create policy "Users can view their own wishlist items" on wishlist_items
    for select using (auth.uid() = user_id);

create policy "Users can insert their own wishlist items" on wishlist_items
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own wishlist items" on wishlist_items
    for delete using (auth.uid() = user_id);

-- Marketplace Orders
create policy "Users can view their own orders" on marketplace_orders
    for select using (auth.uid() = user_id);

create policy "Farmers can view orders for their products" on marketplace_orders
    for select using (auth.uid() = farmer_id);

create policy "Users can create their own orders" on marketplace_orders
    for insert with check (auth.uid() = user_id);

-- Fixed policy - don't refer to 'new' in the USING clause
create policy "Users can update their own orders with limitations" on marketplace_orders
    for update using (auth.uid() = user_id)
    with check (status = 'pending' OR status = 'cancelled');

-- Fixed policy - don't refer to 'new' in the USING clause
create policy "Farmers can update order status for their orders" on marketplace_orders
    for update using (auth.uid() = farmer_id)
    with check (status IN ('processing', 'shipped', 'delivered', 'cancelled'));

-- Order Items
create policy "Users can view their own order items" on order_items
    for select using (
        exists (
            select 1 from marketplace_orders
            where marketplace_orders.id = order_items.order_id
            and (marketplace_orders.user_id = auth.uid() or marketplace_orders.farmer_id = auth.uid())
        )
    );

create policy "System can create order items" on order_items
    for insert with check (
        exists (
            select 1 from marketplace_orders
            where marketplace_orders.id = order_items.order_id
            and marketplace_orders.user_id = auth.uid()
        )
    );