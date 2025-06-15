import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle],
})
export class HomePage {
  title = 'Mahara Platform';
  services: any[] = [];
  isLoading = false;

  constructor() {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.services = [
        { id: 1, title: 'House Cleaning', category: 'Cleaning', price: 50 },
        { id: 2, title: 'Plumbing Repair', category: 'Maintenance', price: 75 },
        { id: 3, title: 'Tutoring', category: 'Education', price: 30 }
      ];
      this.isLoading = false;
    }, 1000);
  }

  searchServices(query: string) {
    if (!query.trim()) {
      this.loadServices();
      return;
    }
    
    this.services = this.services.filter(service => 
      service.title.toLowerCase().includes(query.toLowerCase()) ||
      service.category.toLowerCase().includes(query.toLowerCase())
    );
  }

  getServiceCount(): number {
    return this.services.length;
  }

  getTotalValue(): number {
    return this.services.reduce((total, service) => total + service.price, 0);
  }
}
