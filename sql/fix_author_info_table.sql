-- Check for and drop any existing triggers on the author_info table
DO $$ 
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'public.author_info'::regclass
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON public.author_info;';
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- Check for and drop any functions related to updating timestamps
DROP FUNCTION IF EXISTS update_modified_column();

-- Check if updated_at column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'author_info' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.author_info ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to author_info table';
    END IF;
END $$;

-- Check if created_at column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'author_info' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.author_info ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to author_info table';
    END IF;
END $$;

-- Display the current structure of the author_info table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'author_info'
ORDER BY ordinal_position;
