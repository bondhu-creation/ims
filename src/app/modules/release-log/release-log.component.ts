import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RELEASE_LOGS, ReleaseLogItem } from '@app/core/constants/release-log';

// Public page (no login): what changed in each release, for shop owners and staff.
// Releases are listed newest first; only the newest starts expanded.
@Component({
  selector: 'app-release-log',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './release-log.component.html',
  styleUrls: ['./release-log.component.scss'],
})
export class ReleaseLogComponent {
  releaseLogs = RELEASE_LOGS;
  expanded: boolean[] = RELEASE_LOGS.map((_, index) => index === 0);

  toggle(index: number): void {
    this.expanded[index] = !this.expanded[index];
  }

  getTypeClass(type: ReleaseLogItem['type']): string {
    if (type === 'New') return 'bg-[#E9E7FB] text-[#594ED1]';
    if (type === 'Improved') return 'bg-[#E6F4E2] text-[#3E8A2C]';
    return 'bg-[#FDE7EF] text-[#DF1463]';
  }
}
