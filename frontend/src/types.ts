export interface Guitar {
  id: string;
  name: string;
  series: 'Sun' | 'Wave' | 'Light' | 'Master';
  price: number;
  image: string;
  woodType: string;
  description?: string;
}

export interface SavedDesign {
  id: string;
  name: string;
  specs: string;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'In Production' | 'Shipped' | 'Completed' | 'In Transit';
  customer?: string;
  specs?: string;
  estimatedDelivery?: string;
}
