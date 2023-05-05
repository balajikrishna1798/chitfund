# Generated by Django 4.2 on 2023-05-01 10:57

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('sharetype', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('kyc', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='shareholder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('number_of_shares', models.IntegerField()),
                ('starting_share', models.IntegerField()),
                ('ending_share', models.IntegerField()),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_by_shareholder', to=settings.AUTH_USER_MODEL)),
                ('kyc', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='kyc.kyc')),
                ('share_type', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='sharetype.sharetype')),
                ('updated_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='updated_by_shareholder', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]