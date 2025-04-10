import { Component, inject } from '@angular/core';
import {NdlService} from '../../services/ndl.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private ndlService = inject(NdlService);
  testVar: string = '123';

  // fundData = this.ndlService.getFundData('SPY');
}
