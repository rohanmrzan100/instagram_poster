import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronExpressionParser } from 'cron-parser';
import { InstagramService } from 'src/instagram/instagram.service';

@Injectable()
export class TaskService {
  constructor(private instagramService: InstagramService) {}

  private readonly cronExpression = CronExpression.EVERY_HOUR;
  @Cron(CronExpression.EVERY_HOUR)
  async handleCronGroq() {
    await this.instagramService.publishFootballOnInstagram();
    await this.instagramService.publishQuotesContent();
  }

  getTimeUntilNextExecution(): string {
    const now = new Date();
    const interval = CronExpressionParser.parse(this.cronExpression);
    const next = interval.next().toDate();
    const diffMs = next.getTime() - now.getTime();

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${diffHours}h ${diffMinutes}m ${diffSeconds}s`;
  }
}
