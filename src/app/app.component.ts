import { Component, OnInit } from '@angular/core';
import { Product } from './product';
import { ProductService } from './product-service/product.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public products: Product[];
  public name: string;
  public editProduct: Product;
  public deleteProduct: Product;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.getProducts();
  }

  public getProducts(): void {
    this.productService.getAllProducts().subscribe(
      (response: Product[]) => {
        this.products = response;
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
      }
    );
  }

  public onUpdateProduct(product: Product): void {
    if (!product.id) {
      
      alert("Product ID is missing. Please select a valid product to update.");
      return;
    }

    this.productService.updateProduct(product).subscribe((response: Product) => {
      console.log(response);
      this.getProducts();
      this.editProduct = null; 
    });
  }

  public onAddProduct(addForm: NgForm): void {
    document.getElementById('add-product-form')?.click();

    this.productService.createProduct(addForm.value).subscribe(
      (response: Product) => {
        console.log(response);
        this.getProducts();
        addForm.reset();
      },
      (error: HttpErrorResponse) => {
        alert(error.message);
        addForm.reset();
      }
    );
  }

  public searchProduct(key: string): void {
    console.log(key);
    const results: Product[] = [];
    for (const product of this.products) {
      if (
        product.name.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
        product.price.toString().indexOf(key.toLowerCase()) !== -1 ||
        product.quantity.toString().indexOf(key.toLowerCase()) !== -1
      ) {
        results.push(product);
      }
    }
    this.products = results;
    if (results.length === 0 || !key) {
      this.getProducts();
    }
  }
  
  onDeleteProduct(product: Product) {
    this.productService.deleteProduct(product.id).subscribe(
      () => {
        // Product was successfully deleted, so remove it from the products list.
        this.products = this.products.filter((p) => p.id !== product.id);
        // You can also display a success message here if needed.
      },
      (error) => {
        console.error('Error deleting product:', error);
        // Handle error (e.g., display an error message).
      }
    );
  }

  public onConfirmDelete(): void {
    if (this.deleteProduct) {
      this.productService.deleteProduct(this.deleteProduct.id).subscribe(
        (response: Product) => {
          console.log('Product deleted successfully:', response);
          this.getProducts(); // Refresh the product list after deletion
          this.deleteProduct = null; // Reset the deleteProduct property after successful deletion
        },
        (error: HttpErrorResponse) => {
          console.error('Error deleting product:', error.message);
          alert('An error occurred while deleting the product.');
        }
      );
    }
  }

  public onOpenModal(product: Product, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'add') {
      button.setAttribute('data-target', '#addProductModal');
    }
    if (mode === 'edit') {
      this.editProduct = { ...product }; 
      button.setAttribute('data-target', '#updateProductModal');
    }
    if (mode === 'delete') {
      this.deleteProduct = product; 
      button.setAttribute('data-target', '#deleteProductModal');
    }
    container.appendChild(button);
    button.click();
  }

}
