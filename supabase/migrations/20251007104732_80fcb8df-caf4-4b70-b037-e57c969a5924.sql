-- Create scenarios table
CREATE TABLE public.scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email captures table
CREATE TABLE public.email_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  scenario_name VARCHAR(100),
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_scenarios_created ON public.scenarios(created_at DESC);
CREATE INDEX idx_email_email ON public.email_captures(email);

-- Enable Row Level Security
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

-- Create policies for scenarios (public access for demo purposes)
CREATE POLICY "Enable read access for all users" 
ON public.scenarios 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.scenarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.scenarios 
FOR UPDATE 
USING (true);

CREATE POLICY "Enable delete for all users" 
ON public.scenarios 
FOR DELETE 
USING (true);

-- Create policies for email_captures (public insert only)
CREATE POLICY "Enable insert for all users" 
ON public.email_captures 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_scenarios_updated_at
BEFORE UPDATE ON public.scenarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();