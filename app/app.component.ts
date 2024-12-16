import { Component, HostListener } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  currency = "$";
  productsData: any;
  loader = true;
  loaderShowed = true;

  form = this.fb.group({
    product: ["", Validators.required],
    name: ["", Validators.required],
    phone: ["", Validators.required],
  });

  mainImageStyle: any;
  orderImageStyle: any;

  // @HostListener("document: mousemove", ["$event"])
  // onMouseMove(e: MouseEvent) {
  //   // this.mainImageStyle = {transform: "translate(" + ((e.clientX * 0.3) / 8) + "px," + ((e.clientY * 0.3) / 8) + "px)"};
  //   // this.orderImageStyle = {transform: "translate(-" + ((e.clientX * 0.3) / 8) + "px,-" + ((e.clientY * 0.3) / 8) + "px)"};
  //
  // }

  isButtonVisible: boolean = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.isButtonVisible = scrollY > 1500;
  }

  constructor(private fb: FormBuilder, private http: HttpClient) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.loaderShowed = false;
    }, 2000);

    setTimeout(() => {
      this.loader = false;
    }, 3000);

    this.http.get("https://testologia.ru/cookies").subscribe(data => this.productsData = data);
  }

  // scrollTo(target: HTMLElement, product?: any) {
  //   target.scrollIntoView({behavior: "smooth"});
  //   if (product) {
  //     this.form.patchValue({product: product.title + ' (' + product.price + ' ' + this.currency + ')'});
  //   }
  // }

  scrollTo(target: HTMLElement, product?: any): void {
    const scrollDuration = 1300; // Длительность скролла (в миллисекундах)
    const startPosition = window.scrollY;
    const targetPosition = target.getBoundingClientRect().top + startPosition; // Позиция элемента
    const startTime = performance.now();

    const easeOutQuad = (t: number) => t * (2 - t); // Функция easing (плавное замедление)

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / scrollDuration, 1);
      const easeProgress = easeOutQuad(progress);

      window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);

    // Логика для обновления формы, если передан продукт
    if (product) {
      this.form.patchValue({ product: product.title + ' (' + product.price + ' ' + this.currency + ')' });
    }
  }

  // scrollToTop(): void {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }

  scrollToTop(): void {
    const scrollDuration = 2500; // Длительность в миллисекундах
    const startPosition = window.scrollY;
    const startTime = performance.now();

    const easeOutQuad = (t: number) => t * (2 - t); // Функция плавного замедления (easing)

    const animateScroll = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / scrollDuration, 1); // Ограничиваем progress значением 1
      const easeProgress = easeOutQuad(progress);

      window.scrollTo(0, startPosition * (1 - easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  switchSugarFree(e: any) {
    this.http.get("https://testologia.ru/cookies" + (e.currentTarget.checked ? '?sugarfree' : ''))
      .subscribe(data => this.productsData = data);
  }

  changeCurrency() {
    let newCurrency = "$";
    let coefficient = 1;

    if (this.currency === "$") {
      newCurrency = "₽";
      coefficient = 90;
    } else if (this.currency === "₽") {
      newCurrency = "BYN";
      coefficient = 3;
    } else if (this.currency === 'BYN') {
      newCurrency = '€';
      coefficient = 0.9;
    } else if (this.currency === '€') {
      newCurrency = '¥';
      coefficient = 6.9;
    }
    this.currency = newCurrency;

    this.productsData.forEach((item: any) => {
      item.price = +(item.basePrice * coefficient).toFixed(1);
    });
  }

  confirmOrder() {
    if (this.form.valid) {
      this.http.post("https://testologia.ru/cookies-order", this.form.value)
        .subscribe({
          next: (response: any) => {
            alert(response.message);
            this.form.reset();
          },
          error: (response: any) => {
            alert(response.error.message);
          }
        });
    }
  }
}
