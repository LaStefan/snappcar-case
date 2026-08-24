import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AppComponent } from './app.component';
import { CarSearchComponent } from './car-search/car-search.component';
import { SearchControlsComponent } from './car-search/search-controls/search-controls.component';
import { SearchResultsComponent } from './car-search/search-results/search-results.component';
import { CarCardComponent } from './car-search/car-card/car-card.component';

@NgModule({
  declarations: [
    AppComponent,
    CarSearchComponent,
    SearchControlsComponent,
    SearchResultsComponent,
    CarCardComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
