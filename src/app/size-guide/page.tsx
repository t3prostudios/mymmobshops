import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ruler, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Size Guide | VogueVerse',
  description: 'Find your perfect fit with our detailed size guide.',
};

export default function SizeGuidePage() {
  return (
    <div className="bg-secondary py-20">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <Ruler className="mx-auto h-12 w-12 text-primary" />
          <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mt-4">
            Size Guide: Find Your Perfect Fit
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Welcome! We want your sweatsuits and jogger suits to fit exactly how
            you want them to. Please follow these steps to find your best size.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Part 1: How to Measure Yourself</CardTitle>
              <CardDescription>
                Use a flexible tape measure and ensure the tape is snug, but not
                tight, against your body.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Measurement Point</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">A. Chest/Bust</TableCell>
                    <TableCell>
                      Measure around the fullest part of your chest/bust,
                      keeping the tape level under your arms and across your
                      shoulder blades.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">B. Waist</TableCell>
                    <TableCell>
                      Measure around the narrowest part of your natural waist
                      (usually just above the belly button).
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">C. Hips</TableCell>
                    <TableCell>
                      Measure around the fullest part of your hips/seat, keeping
                      your feet close together.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">D. Inseam</TableCell>
                    <TableCell>
                      Measure from the crotch seam down to the bottom of the
                      ankle (where you want the hem to sit). This is for the
                      pants.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">E. Sleeve Length</TableCell>
                    <TableCell>
                      Measure from the center back of your neck, across the
                      shoulder, and down to your wrist. (For the top).
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Part 2: Size Charts (Based on Body Measurements)
              </CardTitle>
              <CardDescription>
                Compare your body measurements to the tables below. If you fall
                between two sizes, order the smaller size for a tighter fit or
                the larger size for a looser, more relaxed fit. All
                measurements are in inches (").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">
                  Tops (Hoodies & Sweatshirts)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Chest/Bust (A)</TableHead>
                      <TableHead>Waist (B)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>XS</TableCell>
                      <TableCell>30 - 32</TableCell>
                      <TableCell>24 - 26</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>S</TableCell>
                      <TableCell>33 - 35</TableCell>
                      <TableCell>27 - 29</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>M</TableCell>
                      <TableCell>36 - 38</TableCell>
                      <TableCell>30 - 32</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>L</TableCell>
                      <TableCell>39 - 41</TableCell>
                      <TableCell>33 - 35</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>XL</TableCell>
                      <TableCell>42 - 44</TableCell>
                      <TableCell>36 - 38</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>2XL</TableCell>
                      <TableCell>45 - 47</TableCell>
                      <TableCell>39 - 42</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>3XL</TableCell>
                      <TableCell>48 - 51</TableCell>
                      <TableCell>43 - 46</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  Bottoms (Joggers & Sweatpants)
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Waist (B)</TableHead>
                      <TableHead>Hips (C)</TableHead>
                      <TableHead>Inseam (D)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>XS</TableCell>
                      <TableCell>24 - 27</TableCell>
                      <TableCell>31 - 34</TableCell>
                      <TableCell>28 - 30</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>S</TableCell>
                      <TableCell>28 - 31</TableCell>
                      <TableCell>35 - 38</TableCell>
                      <TableCell>29 - 31</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>M</TableCell>
                      <TableCell>32 - 35</TableCell>
                      <TableCell>39 - 42</TableCell>
                      <TableCell>30 - 32</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>L</TableCell>
                      <TableCell>36 - 39</TableCell>
                      <TableCell>43 - 46</TableCell>
                      <TableCell>31 - 33</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>XL</TableCell>
                      <TableCell>40 - 43</TableCell>
                      <TableCell>47 - 50</TableCell>
                      <TableCell>32 - 34</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>2XL</TableCell>
                      <TableCell>44 - 47</TableCell>
                      <TableCell>51 - 54</TableCell>
                      <TableCell>32.5 - 34.5</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>3XL</TableCell>
                      <TableCell>48 - 51</TableCell>
                      <TableCell>55 - 58</TableCell>
                      <TableCell>33 - 35</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>
                Part 3: Garment Measurements (For Best Comparison)
              </CardTitle>
              <CardDescription>
                To guarantee the best fit, lay your favorite, best-fitting sweatsuit/joggers flat and measure the garment itself, then compare those numbers to the chart below.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Jacket Chest (PTP)</TableHead>
                      <TableHead>Pant Waist (Relaxed)</TableHead>
                      <TableHead>Pant Inseam</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>XS</TableCell>
                      <TableCell>18"</TableCell>
                      <TableCell>26"</TableCell>
                      <TableCell>29"</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>S</TableCell>
                      <TableCell>19.5"</TableCell>
                      <TableCell>28"</TableCell>
                      <TableCell>30"</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>M</TableCell>
                      <TableCell>21"</TableCell>
                      <TableCell>30"</TableCell>
                      <TableCell>31"</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>L</TableCell>
                      <TableCell>22.5"</TableCell>
                      <TableCell>32"</TableCell>
                      <TableCell>32"</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>XL</TableCell>
                      <TableCell>24"</TableCell>
                      <TableCell>34"</TableCell>
                      <TableCell>32.5"</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>2XL</TableCell>
                      <TableCell>25.5"</TableCell>
                      <TableCell>36"</TableCell>
                      <TableCell>33"</TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell>3XL</TableCell>
                      <TableCell>27"</TableCell>
                      <TableCell>38"</TableCell>
                      <TableCell>33.5"</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Part 4: Fit & Care Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2">
                <p><strong>Relaxed Fit:</strong> All of our sweatsuits are designed for a comfortable, relaxed fit. If you prefer a more tailored or slim look, consider sizing down.</p>
                <p><strong>Elastic Waistbands:</strong> The waist measurements in Part 2 reflect your body size, and our elastic waistbands are designed to comfortably accommodate that range.</p>
                <p><strong>Fabric Shrinkage:</strong> All items are pre-shrunk, but a small amount of additional shrinkage (typically less than 1-2%) may occur if dried on high heat. We recommend washing cold and tumble drying low or air drying.</p>
            </CardContent>
          </Card>
          
          <p className="text-center text-muted-foreground">
                Still Unsure? Please contact our <Link href="/contact" className="text-primary underline">customer support team</Link> for personalized sizing advice!
            </p>
        </div>
      </div>
    </div>
  );
}
