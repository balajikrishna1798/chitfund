# Generated by Django 4.2 on 2023-05-16 06:30

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import loan.utils


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('kyc', '0002_kyc_slug'),
    ]

    operations = [
        migrations.CreateModel(
            name='due',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('due_amount', models.DecimalField(decimal_places=4, max_digits=10)),
                ('paid_amount', models.DecimalField(decimal_places=4, default=0, max_digits=10)),
                ('due_date', models.DateTimeField()),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='receipt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('amount', models.DecimalField(decimal_places=4, max_digits=10)),
                ('active', models.BooleanField(default=False)),
                ('due', models.ManyToManyField(blank=True, null=True, to='loan.due')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('amount', models.DecimalField(decimal_places=4, max_digits=10)),
                ('active', models.BooleanField(default=False)),
                ('due', models.ManyToManyField(blank=True, null=True, to='loan.due')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='loan',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('amount', models.DecimalField(decimal_places=4, max_digits=10)),
                ('interest_type', models.CharField(choices=[('EMI', 'Emi'), ('Term Loan', 'Termloan')], default=loan.utils.InterestTypes['Termloan'], max_length=10)),
                ('emi_period', models.CharField(blank=True, choices=[('3 Months', 'ThreeMonths'), ('6 Months', 'SixMonths'), ('12 Months', 'TwelveMonths'), ('24 Months', 'TwentyFourMonths')], max_length=10, null=True)),
                ('loan_date_on', models.DateTimeField()),
                ('active', models.BooleanField(default=True)),
                ('roi', models.DecimalField(decimal_places=4, max_digits=10)),
                ('maturity_term', models.DateTimeField(blank=True, null=True)),
                ('slug', models.SlugField(blank=True, null=True, unique=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_by_loan', to=settings.AUTH_USER_MODEL)),
                ('kyc', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='loan', to='kyc.kyc')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='updated_by_loan', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='due',
            name='loan',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='due', to='loan.loan'),
        ),
    ]
