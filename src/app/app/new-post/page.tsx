'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar as CalendarIcon, UploadCloud, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { newPostAction, type NewPostState } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : 'Submit Post'}
    </Button>
  );
}

export default function NewPostPage() {
  const initialState: NewPostState = { message: '', success: false };
  const [state, formAction, isPending] = useActionState(newPostAction, initialState);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const [date, setDate] = useState<Date>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if(state.success){
        toast({
            title: 'Post Created!',
            description: 'Your post has been successfully created and is now live.'
        });
        router.push('/app/feed');
    } else if (state.message && !state.success) {
        toast({
            title: 'Error creating post',
            description: state.message,
            variant: 'destructive',
        });
    }
  }, [state, toast, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        const randomItemImage = PlaceHolderImages.find(img => img.id.startsWith('lost-'))!;
        setImageUrl(randomItemImage.imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (!user || user.type !== 'user') return null;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
       <Button asChild variant="ghost" className="mb-4">
          <Link href="/app/feed"><ArrowLeft />Back to Feed</Link>
        </Button>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>
            Fill in the details about the item you've lost or found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label>This is a...</Label>
              <RadioGroup name="postType" defaultValue="lost" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost Item Report</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found Item Report</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Post Title</Label>
              <Input id="title" name="title" placeholder="e.g., 'Lost Black Wallet'" required />
               {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide as much detail as possible. Where did you last see it? Any identifying marks?"
                required
              />
               {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="location" name="location" placeholder="e.g., 'Library, 2nd Floor'" required className="pl-10"/>
                </div>
                {state.errors?.location && <p className="text-sm text-destructive">{state.errors.location[0]}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="date">Date Lost/Found</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <input type="hidden" name="date" value={date ? date.toISOString() : ''} />
                    {state.errors?.date && <p className="text-sm text-destructive">{state.errors.date[0]}</p>}
                </div>
            </div>
            
            <div className="space-y-2">
              <Label>Item Image (Optional)</Label>
              <div 
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                onClick={handleUploadClick}
              >
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Item preview" width={200} height={125} className="mx-auto rounded-md object-cover"/>
                  ) : (
                    <>
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Upload a photo of the item
                    </p>
                    </>
                  )}
                </div>
              </div>
              <Input 
                id="itemImage-file" 
                name="itemImage-file" 
                type="file" 
                accept="image/*"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <input type="hidden" name="itemImageURL" value={imageUrl} />
            </div>

            <input type="hidden" name="postedBy" value={user.userId} />
            <input type="hidden" name="postedByName" value={user.fullName} />

            <SubmitButton pending={isPending} />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
