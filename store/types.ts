type cartItemT = {
  id: string;
  title: string;
  description: string;
  inventory: number;

  createdAt: Date;
  updatdAt: Date;
  comments: any[];
  ratings: any[];
  orderItems: any[]
}

export type initialT = {
  name: string;
  phone: string;
  cart: cartItemT[]
}

export type userStoreT = {
  initial: initialT;
  setUser: (state:initialT)=>void;
  setInit: ()=>void;
}

