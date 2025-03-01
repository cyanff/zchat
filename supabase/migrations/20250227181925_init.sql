-- Authorization:
--   - SELECT: Users can read all profiles 
--   - UPDATE: Users can update their own profile where they are the creator (pre-condition: created_by = auth.uid()) and remain the creator (post-condition: created_by = auth.uid()).
create table profiles
(
    id                  uuid references auth.users on delete cascade not null primary key,
    username            varchar(25) unique check (char_length(username) > 0 and username ~ '^[a-zA-Z0-9_-]+$') not null,
    created_at          double precision DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000) not null,
    updated_at          double precision
);
create index idx_profiles_username on profiles (username);

create type username_seed_kind as enum ('adjective', 'noun');
create table username_seed (
    id         bigint primary key generated always as identity,
    seed varchar(64) not null,
    kind username_seed_kind not null
);


-- 1. create or replace the initialize profile function with username generation
create or replace function initialize_profile_function()
returns trigger as $$
declare
    -- configurable maximum length for username
    max_length int := 25;
    generated_username varchar(64);
    adj text;
    noun text;
    num int;
    attempts int := 0;
    max_attempts int := 20; -- maximum retry attempts
begin
    -- loop to generate a unique username
    loop
        if attempts >= max_attempts then
            raise exception 'could not generate a unique username after % attempts', max_attempts;
        end if;
        
        -- randomly select an adjective and noun from username_seed table
        select seed into adj from public.username_seed where kind = 'adjective' order by random() limit 1;
        select seed into noun from public.username_seed where kind = 'noun' order by random() limit 1;
        
        -- generate a random number between 0 and 9999
        num := floor(random() * 10000)::int;
        
        -- concatenate to form the username
        generated_username := lower(adj || noun || num);
        
        -- check if the username matches the regex and is within the max length
        if generated_username ~ '^[a-zA-Z0-9_-]+$' and char_length(generated_username) <= max_length then
            -- check for uniqueness
            begin
                -- try to insert the profile with the generated username
                insert into public.profiles (id, username)
                values (new.id, generated_username);
                
                -- if successful, exit the loop
                exit;
            exception when unique_violation then
                -- if username exists, increment attempts and retry
                attempts := attempts + 1;
                continue;
            end;
        end if;
        
        -- increment attempts if constraints are not met
        attempts := attempts + 1;
    end loop;

    return new;
end;
$$ language plpgsql security definer set search_path = '';

revoke all on function initialize_profile_function from public, anon, authenticated;
create or replace trigger initialize_profile_trigger after insert on auth.users for each row execute function initialize_profile_function();


create function update_updated_at() returns trigger as
$$
begin
    new.updated_at = (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000);
    return new;
end;
$$ language plpgsql security definer set search_path = '';
revoke all on function update_updated_at() from public, anon, authenticated;



-- Authorization:
--   - SELECT: Users can read their own chats (created_by = auth.uid()) or public chats (is_public = true).
--   - INSERT: Users can create their own chats (created_by = auth.uid()).
--   - UPDATE: Users can update their own chats where they are the creator (pre-condition: created_by = auth.uid()) and remain the creator (post-condition: created_by = auth.uid()).
--   - DELETE: Users can delete their own chats (created_by = auth.uid()).
create table chats
(
    id         varchar(128) not null primary key,
    is_public  boolean                  default false                 not null,
    created_by uuid                     default auth.uid()            not null
        references profiles
            on delete cascade,
    created_at double precision DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000) not null,
    title      varchar(255) default 'New Chat' not null,
    updated_at double precision
);

create index idx_chats_created_by
    on chats (created_by);

create trigger chats_updated_at_trigger
    before update
    on chats
    for each row
execute procedure update_updated_at();



-- Authorization:
--   - SELECT: Users can read messages in chats they own (chats.created_by = auth.uid()) or public chats (chats.is_public = true).
--   - INSERT: Users can add messages to chats they own (chats.created_by = auth.uid()).
--   - UPDATE: Users can update their own messages where they are the creator (pre-condition: created_by = auth.uid()) and remain the creator (post-condition: created_by = auth.uid()) in chats they own (chats.created_by = auth.uid()).
--   - DELETE: Users can delete their own messages (created_by = auth.uid()) in chats they own (chats.created_by = auth.uid()).
create table messages
(
    id                 varchar(128) not null primary key,
    chat_id            varchar(128)                                     not null
        references chats
            on delete cascade,
    text               varchar(65536)                                   not null,
    is_ai              boolean,
    created_by         uuid                     default auth.uid()      not null
        references profiles
            on delete cascade,
    created_at         double precision DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000) not null,
    updated_at         double precision
);

create index idx_messages_chat_id
    on messages (chat_id);

create index idx_messages_created_by
    on messages (created_by);

create trigger messages_updated_at_trigger
    before update
    on messages
    for each row
execute procedure update_updated_at();


CREATE OR REPLACE PROCEDURE seed_chat_data(
    num_chats INT DEFAULT 5,
    messages_per_chat INT DEFAULT 10
)
    LANGUAGE plpgsql
AS $$
DECLARE
    user_id UUID := '99999999-9999-9999-9999-999999999999';
    chat_id VARCHAR(128);
    message_id VARCHAR(128);
    i INT;
    j INT;
    is_ai BOOLEAN;
    current_timestamp_epoch DOUBLE PRECISION;
BEGIN
    -- Get current timestamp as epoch
    current_timestamp_epoch := (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000);
    
    -- Ensure the user exists in profiles
    INSERT INTO profiles (id, username)
    VALUES (user_id, 'testuser' || floor(random() * 1000)::text)
    ON CONFLICT (id) DO NOTHING;

    -- Create chats
    FOR i IN 1..num_chats LOOP
            chat_id := 'chat_' || i || '_' || floor(random() * 1000000)::text;

            -- Insert chat
            INSERT INTO chats (id, is_public, created_by)
            VALUES (chat_id, CASE WHEN random() > 0.7 THEN TRUE ELSE FALSE END, user_id);

            -- Create messages for this chat
            FOR j IN 1..messages_per_chat LOOP
                    -- Alternate between user and AI messages
                    is_ai := (j % 2 = 0);

                    message_id := 'msg_' || i || '_' || j || '_' || floor(random() * 1000000)::text;

                    -- Insert message
                    INSERT INTO messages (id, chat_id, text, is_ai, created_by)
                    VALUES (
                               message_id,
                               chat_id,
                               CASE
                                   WHEN is_ai THEN 'AI response ' || j || ' for chat ' || i
                                   ELSE 'User message ' || j || ' for chat ' || i
                                   END,
                               is_ai,
                               user_id
                           );
                END LOOP;
        END LOOP;

    -- Output summary
    RAISE NOTICE 'Seeded % chats with % messages each (% total messages)',
        num_chats,
        messages_per_chat,
        num_chats * messages_per_chat;
END;
$$;