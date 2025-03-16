import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import Image from 'next/image';

// Avatar styles from DiceBear API
const AVATAR_STYLES = {
  'Corporate': [
    'https://api.dicebear.com/7.x/personas/svg?seed=exec1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/personas/svg?seed=exec2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/personas/svg?seed=exec3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/personas/svg?seed=exec4&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/personas/svg?seed=exec5&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/personas/svg?seed=exec6&backgroundColor=c1f4c5',
  ],
  'Fun': [
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=happy&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=silly&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=party&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=ninja&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=pirate&backgroundColor=c1f4c5',
  ],
  'Cartoons': [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon4&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon5&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=cartoon6&backgroundColor=c1f4c5',
  ],
  'Pixel': [
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel4&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel5&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel6&backgroundColor=c1f4c5',
  ],
  'Animals': [
    'https://api.dicebear.com/7.x/bottts/svg?seed=kitty&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=puppy&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/bottts/svg?seed=bunny&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/bottts/svg?seed=fox&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=c1f4c5',
  ],
  'Avatars': [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro3&backgroundColor=ffdfbf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro4&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro5&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=pro6&backgroundColor=c1f4c5',
  ],
};

interface AvatarPickerProps {
  onSubmit: (name: string, avatarUrl: string) => void;
}

export function AvatarPicker({ onSubmit }: AvatarPickerProps) {
  const [name, setName] = React.useState('');
  const [selectedStyle, setSelectedStyle] = React.useState('Corporate');
  const [selectedAvatar, setSelectedAvatar] = React.useState(AVATAR_STYLES[selectedStyle as keyof typeof AVATAR_STYLES][0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name, selectedAvatar);
    }
  };

  return (
    <Card className="w-[400px] shadow-xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-blue-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200">
          Join Game
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="bg-white dark:bg-gray-800"
            />
          </div>

          <div className="space-y-4">
            <Label>Choose Avatar</Label>
            <Tabs defaultValue="Corporate" onValueChange={setSelectedStyle}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {Object.keys(AVATAR_STYLES).map((style) => (
                  <TabsTrigger key={style} value={style} className="text-xs">
                    {style}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(AVATAR_STYLES).map(([style, avatars]) => (
                <TabsContent key={style} value={style}>
                  <div className="grid grid-cols-3 gap-4">
                    {avatars.map((avatar) => (
                      <motion.div
                        key={avatar}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full h-full aspect-square p-2 ${
                            selectedAvatar === avatar 
                              ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                              : ''
                          }`}
                          onClick={() => setSelectedAvatar(avatar)}
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={avatar}
                              alt="Avatar option"
                              fill
                              sizes="100px"
                              className="object-contain"
                              priority
                            />
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            Join Game
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}