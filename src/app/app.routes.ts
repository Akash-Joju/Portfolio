import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
// import { AboutComponent } from './pages/about/about.component';
// import { ServicesComponent } from './pages/services/services.component';
// import { ServiceDetailsComponent } from './pages/service-details/service-details.component';
// import { ProductsComponent } from './pages/products/products.component';
// import { ProductDetailsComponent } from './pages/product-details/product-details.component';
// import { CareerComponent } from './pages/career/career.component';
// import { CareerDetailsComponent } from './pages/career-details/career-details.component';

// import { ContactComponent } from './pages/contact/contact.component';
// import { adminRoutes } from './admin/app.routes';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'index.html', component: HomeComponent },
  // { path: 'about', component: AboutComponent },
  // { path: 'about.html', component: AboutComponent },
  // { path: 'services', component: ServicesComponent },
  // { path: 'services.html', component: ServicesComponent },
  // { path: 'service-details', component: ServiceDetailsComponent },
  // { path: 'service-details.html', component: ServiceDetailsComponent },
  // { path: 'products', component: ProductsComponent },
  // { path: 'products.html', component: ProductsComponent },
  // { path: 'product-details', component: ProductDetailsComponent },
  // { path: 'product-details.html', component: ProductDetailsComponent },
  // { path: 'career', component: CareerComponent },
  // { path: 'career.html', component: CareerComponent },
  // { path: 'career-details', component: CareerDetailsComponent },
  // { path: 'career-details.html', component: CareerDetailsComponent },
  // { path: 'blogs', component: BlogsComponent },
  // { path: 'blogs.html', component: BlogsComponent },
  // { path: 'blog-details', component: BlogDetailsComponent },
  // { path: 'blog-details.html', component: BlogDetailsComponent },
  // { path: 'blog/:slug', component: BlogDetailsComponent },
  // { path: 'contact', component: ContactComponent },
  // { path: 'contact.html', component: ContactComponent },
  // ...adminRoutes,
  { path: '**', redirectTo: '' }
];
